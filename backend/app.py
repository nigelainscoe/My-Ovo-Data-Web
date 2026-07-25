"""FastAPI application for My-OVO-Data (web edition).

Endpoints
---------
POST /api/login          {username, password}            -> accounts list
GET  /api/accounts                                       -> cached accounts
POST /api/fetch-usage    {accountId, stopWhen}           -> starts background job
POST /api/fetch-readings {accountId}                     -> starts background job
GET  /api/status                                         -> current job progress
GET  /api/summary?accountId=...                          -> usage summary table
GET  /                                                   -> single-page UI

State is process-global and single-user, which is fine for a local tool: run
it, open http://127.0.0.1:8000, use it. Credentials live in memory only.
"""
from __future__ import annotations

import calendar
import datetime as dt
import threading
import traceback
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import config, export
from .database import Database
from .ovo_client import OvoApiError, OvoClient

app = FastAPI(title="My OVO Data")


# --------------------------------------------------------------------- state
class _AppState:
    def __init__(self) -> None:
        self.client: OvoClient | None = None
        self.accounts: list[dict[str, Any]] = []
        self.lock = threading.Lock()
        self.job = _Job()


class _Job:
    """Tracks a single background fetch operation and its progress log."""

    def __init__(self) -> None:
        self.running = False
        self.kind = ""            # "usage" | "readings"
        self.status = "idle"
        self.lines: list[str] = []
        self.error: str | None = None
        self.cancel = False

    def reset(self, kind: str) -> None:
        self.running = True
        self.kind = kind
        self.status = "starting"
        self.lines = []
        self.error = None
        self.cancel = False

    def log(self, message: str) -> None:
        self.status = message
        self.lines.append(message)
        # Keep the log from growing without bound on huge "All Time" pulls.
        if len(self.lines) > 500:
            self.lines = self.lines[-500:]

    def to_dict(self) -> dict[str, Any]:
        return {
            "running": self.running,
            "kind": self.kind,
            "status": self.status,
            "lines": self.lines[-40:],
            "error": self.error,
        }


STATE = _AppState()


# -------------------------------------------------------------- request models
class LoginBody(BaseModel):
    username: str
    password: str


class FetchUsageBody(BaseModel):
    accountId: str
    stopWhen: str = config.STOP_THIS_MONTH


class FetchReadingsBody(BaseModel):
    accountId: str


# --------------------------------------------------------------------- helpers
def _require_client() -> OvoClient:
    if STATE.client is None:
        raise HTTPException(status_code=401, detail="Not logged in.")
    return STATE.client


def _require_idle() -> None:
    if STATE.job.running:
        raise HTTPException(status_code=409, detail="A fetch is already running.")


# ------------------------------------------------------------------ API routes
@app.post("/api/login")
def login(body: LoginBody) -> dict[str, Any]:
    client = OvoClient(log=STATE.job.log)
    try:
        accounts = client.login(body.username, body.password)
    except OvoApiError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except Exception as exc:  # noqa: BLE001 - surface any network/parse error
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"Login error: {exc}")

    STATE.client = client
    STATE.accounts = [a.to_dict() for a in accounts]
    return {"accounts": STATE.accounts, "stopOptions": config.STOP_OPTIONS}


@app.get("/api/accounts")
def accounts() -> dict[str, Any]:
    _require_client()
    return {"accounts": STATE.accounts, "stopOptions": config.STOP_OPTIONS}


@app.get("/api/status")
def status() -> dict[str, Any]:
    return STATE.job.to_dict()


@app.get("/api/summary")
def summary(accountId: str) -> dict[str, Any]:
    _require_client()
    db = Database(accountId)
    return {"summary": db.get_usage_information()}


@app.get("/api/export/csv")
def export_csv(accountId: str) -> Response:
    """Return a ZIP of four CSV files (Monthly, Daily, Half Hourly, Meter Readings)."""
    _require_client()
    data = export.build_csv_zip(accountId)
    return Response(
        content=data,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{accountId}-ovo-export.zip"'},
    )


@app.get("/api/export/excel")
def export_excel(accountId: str) -> Response:
    """Return a single .xlsx workbook with five sheets."""
    _require_client()
    data = export.build_excel(accountId)
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{accountId}.xlsx"'},
    )


@app.post("/api/cancel")
def cancel() -> dict[str, Any]:
    STATE.job.cancel = True
    return {"ok": True}


@app.post("/api/fetch-usage")
def fetch_usage(body: FetchUsageBody) -> dict[str, Any]:
    client = _require_client()
    _require_idle()
    if body.stopWhen not in config.STOP_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid stopWhen value.")
    STATE.job.reset("usage")
    thread = threading.Thread(
        target=_run_fetch_usage, args=(client, body.accountId, body.stopWhen), daemon=True
    )
    thread.start()
    return {"started": True}


@app.post("/api/fetch-readings")
def fetch_readings(body: FetchReadingsBody) -> dict[str, Any]:
    client = _require_client()
    _require_idle()
    STATE.job.reset("readings")
    thread = threading.Thread(
        target=_run_fetch_readings, args=(client, body.accountId), daemon=True
    )
    thread.start()
    return {"started": True}


# ---------------------------------------------------------- background workers
def _run_fetch_usage(client: OvoClient, account_id: str, stop_when: str) -> None:
    """Port of MainWindow.OnClick_ReadUsage: walk years -> months -> days."""
    job = STATE.job
    client.set_logger(job.log)
    db = Database(account_id, log=job.log)
    try:
        now = dt.datetime.now()
        this_year, this_month, this_day = now.year, now.month, now.day
        year = this_year
        months_fetched = 0
        stop = False

        while not stop and not job.cancel:
            last_month = this_month if year == this_year else 12
            job.log(f"Checking Year {year}")

            monthly = client.obtain_monthly_usage(account_id, year)
            monthly_readings = 0
            for fuel, key in (("Electric", "electricity"), ("Gas", "gas")):
                util = monthly.get(key)
                if util and util.get("data"):
                    monthly_readings += db.upsert_monthly(fuel, util["data"])

            if monthly_readings > 0:
                for month in range(last_month, 0, -1):
                    if job.cancel:
                        break

                    last_day = calendar.monthrange(year, month)[1]
                    if year == this_year and month == this_month:
                        last_day = this_day

                    job.log(f"Checking Month {year}-{month:02d}")

                    if (
                        (year == this_year and month == this_month)
                        or db.count_daily("Electric", year, month) < last_day
                        or db.count_daily("Gas", year, month) < last_day
                    ):
                        job.log(f"Fetching Daily Usage - {year}-{month:02d}")
                        daily = client.obtain_daily_usage(account_id, year, month)
                        for fuel, key in (("Electric", "electricity"), ("Gas", "gas")):
                            util = daily.get(key)
                            if util and util.get("data"):
                                db.upsert_daily(fuel, util["data"])

                    for day in range(last_day, 0, -1):
                        if job.cancel:
                            break
                        if (
                            (year == this_year and month == this_month and day == this_day)
                            or (db.has_half_hourly("Electric", year, month, day)
                                and db.count_half_hourly("Electric", year, month, day) < 48)
                            or (db.has_half_hourly("Gas", year, month, day)
                                and db.count_half_hourly("Gas", year, month, day) < 48)
                        ):
                            job.log(f"Fetching Half Hourly Usage - {year}-{month:02d}-{day:02d}")
                            hh = client.obtain_half_hourly_usage(account_id, year, month, day)
                            for fuel, key in (("Electric", "electricity"), ("Gas", "gas")):
                                util = hh.get(key)
                                if util and util.get("data"):
                                    db.upsert_half_hourly(fuel, util["data"])

                    if stop_when == config.STOP_THIS_MONTH and year == this_year and month == this_month:
                        stop = True
                    months_fetched += 1
                    if stop_when == config.STOP_TWO_MONTHS and months_fetched >= 2:
                        stop = True
                    if stop:
                        break

            if stop_when == config.STOP_THIS_YEAR and year == this_year:
                break
            if monthly_readings == 0:
                break
            year -= 1

        job.log("Cancelled." if job.cancel else "Usage fetch complete.")
    except Exception as exc:  # noqa: BLE001
        job.error = str(exc)
        job.log(f"ERROR: {exc}")
    finally:
        job.running = False


def _run_fetch_readings(client: OvoClient, account_id: str) -> None:
    """Port of MainWindow.OnClick_ReadMeterReadings."""
    job = STATE.job
    client.set_logger(job.log)
    db = Database(account_id, log=job.log)
    try:
        supply_points = client.obtain_meter_readings(account_id)
        job.log("Updating meter readings ...")

        for sp in supply_points:
            fuel_type = sp["fuelType"]
            fuel_label = fuel_type.capitalize()
            db.upsert_supply_point(sp)

            for meter in sp["meters"]:
                db.upsert_meter(meter, fuel_type)
                for register in meter["registers"]:
                    if job.cancel:
                        break
                    db.upsert_meter_register(register, fuel_type)
                job.log(f"Saved {len(meter['registers'])} {fuel_label} registers for meter {meter['serialNumber']}")

            records = 0
            for reading in sp["readings"]:
                if job.cancel:
                    break
                db.upsert_meter_reading(reading, fuel_type)
                records += 1
                if records % 25 == 0:
                    job.log(f"Saved {records} {fuel_label} readings")
            job.log(f"Saved {records} {fuel_label} readings")

        job.log(f"Saved {len(supply_points)} supply points")
        job.log("Cancelled." if job.cancel else "Readings fetch complete.")
    except Exception as exc:  # noqa: BLE001
        job.error = str(exc)
        job.log(f"ERROR: {exc}")
    finally:
        job.running = False


# ------------------------------------------------------------- static frontend
@app.get("/")
def index() -> FileResponse:
    return FileResponse(config.STATIC_DIR / "index.html")


app.mount("/", StaticFiles(directory=str(config.STATIC_DIR)), name="static")
