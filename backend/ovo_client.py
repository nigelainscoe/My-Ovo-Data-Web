"""OVO / Kaluza API client.

Python port of the original C# HttpHelper + JwtHelper. Handles:

  * login (username/password -> refresh token cookie -> access token)
  * automatic token refresh (access tokens expire after ~60s)
  * GraphQL queries for accounts and meter readings
  * REST queries for monthly / daily / half-hourly usage

The token model matters: the login response sets a `restricted_refresh_token`
cookie (valid ~30 min); that is exchanged at the token endpoint for a short
lived access token (~60s). Long fetch loops must re-check tokens before every
call, exactly as the original desktop app did in CheckTokens().
"""
from __future__ import annotations

import datetime as dt
import json
from dataclasses import dataclass, field
from typing import Any, Callable

import jwt  # PyJWT
import requests

from . import config

# Every outbound call gets a timeout so a hung/blocked endpoint surfaces as a
# clean error instead of an indefinitely spinning request.
_TIMEOUT = 30

# A browser-like User-Agent; some OVO/Kaluza edges reject the default one.
_DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
}


def _read_resource(name: str) -> str:
    return (config.RESOURCES_DIR / "graphql" / name).read_text(encoding="utf-8")


@dataclass
class _Token:
    """A JWT plus its decoded issued/expiry times."""
    jwt_value: str = ""
    issued_at: dt.datetime | None = None
    expires_at: dt.datetime | None = None

    def set(self, value: str) -> None:
        self.jwt_value = value or ""
        self.issued_at = None
        self.expires_at = None
        if not value:
            return
        try:
            payload = jwt.decode(value, options={"verify_signature": False})
            if "iat" in payload:
                self.issued_at = dt.datetime.fromtimestamp(int(payload["iat"]), tz=dt.timezone.utc)
            if "exp" in payload:
                self.expires_at = dt.datetime.fromtimestamp(int(payload["exp"]), tz=dt.timezone.utc)
        except Exception:
            # Mirror the original: a bad JWT just leaves the times unset.
            pass

    @property
    def has_expired(self) -> bool:
        if self.expires_at is None:
            return True
        # 5s safety margin, matching the original.
        return dt.datetime.now(tz=dt.timezone.utc) + dt.timedelta(seconds=5) > self.expires_at


@dataclass
class Tokens:
    user_guid: str = ""
    access_token: _Token = field(default_factory=_Token)
    refresh_token: _Token = field(default_factory=_Token)


@dataclass
class OvoAccount:
    id: str
    has_electric: bool = False
    electric_start_date: str = ""
    has_gas: bool = False
    gas_start_date: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "hasElectric": self.has_electric,
            "electricStartDate": self.electric_start_date,
            "hasGas": self.has_gas,
            "gasStartDate": self.gas_start_date,
        }


class OvoApiError(RuntimeError):
    pass


LogFn = Callable[[str], None]


class OvoClient:
    """Stateful client. Instantiate once per user session.

    Credentials are held in memory only (used to silently re-login when the
    refresh token expires during a long fetch), never persisted.
    """

    def __init__(self, log: LogFn | None = None):
        self.tokens = Tokens()
        self._username = ""
        self._password = ""
        self._session = requests.Session()
        self._session.headers.update(_DEFAULT_HEADERS)
        self._log = log or (lambda _msg: None)

    def set_logger(self, log: LogFn) -> None:
        self._log = log

    # ------------------------------------------------------------------ login
    def login(self, username: str, password: str) -> list[OvoAccount]:
        """Log in and return the list of OVO accounts. Raises on failure."""
        self._username = username
        self._password = password
        if not self._do_login():
            raise OvoApiError("Login failed - check your username and password.")
        self._do_get_access_token()
        return self._do_get_accounts()

    def _do_login(self) -> bool:
        self._log(f"Logging in as '{self._username}'")
        try:
            resp = self._session.post(
                config.LOGIN_URI,
                # OVO's login endpoint now requires a `rememberMe` field that
                # the original C# app predated (it 400s with
                # "DecodingFailure at .rememberMe: Missing required field"
                # otherwise).
                data=json.dumps({
                    "username": self._username,
                    "password": self._password,
                    "rememberMe": True,
                }),
                headers={"Content-Type": "application/json"},
                timeout=_TIMEOUT,
            )
        except requests.exceptions.RequestException as exc:
            raise OvoApiError(
                f"Could not reach the OVO login endpoint ({config.LOGIN_URI}): {exc}"
            )
        if not resp.ok:
            # Include OVO's message so credential vs. API-shape errors are
            # distinguishable at a glance.
            print(f"[login] HTTP {resp.status_code} {resp.reason}: {resp.text[:200]}")
            self._log(f"Login HTTP {resp.status_code} {resp.reason}")
            return False

        try:
            body = resp.json()
        except ValueError:
            print(f"[login] unexpected non-JSON login response: {resp.text[:200]}")
            body = {}
        self.tokens.user_guid = body.get("userId", "")

        # The refresh token arrives as a Set-Cookie: restricted_refresh_token=...
        refresh = resp.cookies.get("restricted_refresh_token")
        if not refresh:
            # Fall back to the session jar in case of redirects.
            refresh = self._session.cookies.get("restricted_refresh_token")
        if not refresh:
            print("[login] logged in but no restricted_refresh_token cookie "
                  "returned (the login flow may have changed).")
            self._log("No restricted_refresh_token cookie in login response.")
            return False

        self.tokens.refresh_token.set(refresh)
        return True

    def _do_get_access_token(self) -> None:
        resp = self._session.get(
            config.TOKEN_URI,
            headers={"restricted_refresh_token": self.tokens.refresh_token.jwt_value},
            timeout=_TIMEOUT,
        )
        if not resp.ok:
            raise OvoApiError(f"Token exchange HTTP {resp.status_code} {resp.reason}")
        body = resp.json()
        value = (body.get("accessToken") or {}).get("value", "")
        self.tokens.access_token.set(value)

    def _check_tokens(self) -> None:
        """Ensure both tokens are valid before an API call (port of CheckTokens)."""
        if self.tokens.refresh_token.has_expired:
            self._log("Refresh token expired - logging in again.")
            if self._do_login():
                self._do_get_access_token()
        elif self.tokens.access_token.has_expired:
            self._do_get_access_token()

    def _auth_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.tokens.access_token.jwt_value}"}

    # --------------------------------------------------------------- accounts
    def _do_get_accounts(self) -> list[OvoAccount]:
        payload = {
            "operationName": "Bootstrap",
            "variables": {"customerId": self.tokens.user_guid},
            "query": _read_resource("accounts.query"),
        }
        resp = self._session.post(config.ACCOUNTS_URI, json=payload, headers=self._auth_headers(), timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        self._dump("Accounts-Response", data)

        result: list[OvoAccount] = []
        edges = (
            data.get("data", {})
            .get("customer_nextV1", {})
            .get("customerAccountRelationships", {})
            .get("edges", [])
        )
        for edge in edges:
            account = edge.get("node", {}).get("account", {})
            ovo = OvoAccount(id=account.get("id", ""))
            for sp in account.get("accountSupplyPoints", []):
                fuel = (sp.get("supplyPoint", {}) or {}).get("fuelType", "")
                if fuel == config.FUEL_ELECTRICITY:
                    ovo.has_electric = True
                    ovo.electric_start_date = sp.get("startDate", "")
                elif fuel == config.FUEL_GAS:
                    ovo.has_gas = True
                    ovo.gas_start_date = sp.get("startDate", "")
            result.append(ovo)
        return result

    # ------------------------------------------------------------------ usage
    def obtain_monthly_usage(self, account_id: str, year: int) -> dict[str, Any]:
        self._check_tokens()
        uri = config.MONTHLY_URI.format(account=account_id, date=year)
        self._log(f"GET {uri}")
        resp = self._session.get(uri, headers=self._auth_headers(), timeout=_TIMEOUT)
        if not resp.ok:
            self._log(f"Monthly HTTP {resp.status_code} {resp.reason}")
            return {}
        body = resp.json()
        self._dump(f"Monthly-{year}", body)
        return body

    def obtain_daily_usage(self, account_id: str, year: int, month: int) -> dict[str, Any]:
        self._check_tokens()
        uri = config.DAILY_URI.format(account=account_id, date=f"{year}-{month:02d}")
        self._log(f"GET {uri}")
        resp = self._session.get(uri, headers=self._auth_headers(), timeout=_TIMEOUT)
        if not resp.ok:
            self._log(f"Daily HTTP {resp.status_code} {resp.reason}")
            return {}
        body = resp.json()
        self._dump(f"Daily-{year}-{month:02d}", body)
        return body

    def obtain_half_hourly_usage(self, account_id: str, year: int, month: int, day: int) -> dict[str, Any]:
        self._check_tokens()
        uri = config.HALF_HOURLY_URI.format(account=account_id, date=f"{year}-{month:02d}-{day:02d}")
        self._log(f"GET {uri}")
        resp = self._session.get(uri, headers=self._auth_headers(), timeout=_TIMEOUT)
        if not resp.ok:
            self._log(f"Half-hourly HTTP {resp.status_code} {resp.reason}")
            return {}
        body = resp.json()
        self._dump(f"HalfHourly-{year}-{month:02d}-{day:02d}", body)
        return body

    # --------------------------------------------------------------- readings
    def obtain_meter_readings(self, account_id: str) -> list[dict[str, Any]]:
        """Return a list of supply-point dicts, each with meters, registers, readings.

        Shape (per supply point):
          {
            "sprn": str, "fuelType": "ELECTRICITY"|"GAS",
            "startDate": str, "endDate": str|None,
            "meters": [{"serialNumber","fuelType","status","registers":[...]}],
            "readings": [{...SqLiteReading fields...}],
          }
        """
        self._check_tokens()
        payload = {
            "operationName": "MeterReads_nextV1",
            "variables": {"accountId": account_id, "query": {"includeReads": "TOP_VALID_ONLY"}},
            "query": _read_resource("readings.query"),
        }
        resp = self._session.post(config.READINGS_URI, json=payload, headers=self._auth_headers(), timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        self._dump("Readings-Response", data)

        account = data.get("data", {}).get("account", {})
        supply_points = account.get("accountSupplyPoints", []) or []

        result: list[dict[str, Any]] = []
        for fuel in (config.FUEL_ELECTRICITY, config.FUEL_GAS):
            matching = [
                sp for sp in supply_points
                if (sp.get("supplyPoint", {}) or {}).get("fuelType") == fuel
            ]
            if not matching:
                continue

            first_sp = matching[0].get("supplyPoint", {}) or {}
            out_sp: dict[str, Any] = {
                "sprn": first_sp.get("sprn", ""),
                "fuelType": fuel,
                "startDate": _iso_date(matching[0].get("startDate", "")),
                "endDate": _iso_date(((matching[0].get("end") or {}).get("date")) or ""),
                "meters": [],
                "readings": [],
            }

            for asp in matching:
                sp = asp.get("supplyPoint", {}) or {}
                for meter in sp.get("meterTechnicalDetails", []) or []:
                    out_meter = {
                        "serialNumber": meter.get("meterSerialNumber", ""),
                        "fuelType": meter.get("type", ""),
                        "status": meter.get("status", ""),
                        "registers": [],
                    }
                    for reg in meter.get("registers", []) or []:
                        out_meter["registers"].append({
                            "id": reg.get("registerId", ""),
                            "timingCategory": reg.get("timingCategory", ""),
                            "unitOfMeasurement": reg.get("unitMeasurement", ""),
                            "meterSerialNumber": out_meter["serialNumber"],
                            "startDate": _iso_date(reg.get("registerStartDate", "")),
                            "endDate": _iso_date(reg.get("registerEndDate", "")),
                        })
                    out_sp["meters"].append(out_meter)

                edges = (asp.get("meterReads_nextV1", {}) or {}).get("edges", []) or []
                for edge in edges:
                    reading = (edge.get("node", {}) or {}).get("reading", {}) or {}
                    if fuel == config.FUEL_ELECTRICITY:
                        for val in reading.get("registers", []) or []:
                            out_sp["readings"].append({
                                "fuelType": reading.get("type", ""),
                                "date": reading.get("date", ""),
                                "lifeCycle": reading.get("lifecycle", ""),
                                "source": reading.get("source", ""),
                                "meterSerialNumber": reading.get("meterSerialNumber", ""),
                                "timingCategory": val.get("timingCategory", ""),
                                "registerId": val.get("registerId", ""),
                                "value": val.get("value"),
                            })
                    else:  # GAS: single value on the read itself
                        out_sp["readings"].append({
                            "fuelType": reading.get("type", ""),
                            "date": reading.get("date", ""),
                            "lifeCycle": reading.get("lifecycle", ""),
                            "source": reading.get("source", ""),
                            "meterSerialNumber": reading.get("meterSerialNumber", ""),
                            "timingCategory": "",
                            "registerId": "",
                            "value": reading.get("value"),
                        })

            result.append(out_sp)
        return result

    # ------------------------------------------------------------------ utils
    def _dump(self, name: str, obj: Any) -> None:
        if config.DUMP_DATA:
            self._log(f"[{name}] {json.dumps(obj, indent=2, default=str)[:4000]}")


def _iso_date(value: str) -> str:
    """Return the yyyy-MM-dd portion of an ISO date/datetime string, or ''."""
    if not value:
        return ""
    return value[:10]
