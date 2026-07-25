"""SQLite data layer.

Python port of the original C# SqLiteHelper (+ Usage/Readings partials).

Differences from the original, all deliberate:
  * One consolidated schema (the post-V1.0.8 shape) created with
    CREATE TABLE IF NOT EXISTS, instead of the incremental migration files.
    Databases produced by the original desktop app already have this shape,
    so they open unchanged.
  * Parameterised queries everywhere (the original built SQL with string
    interpolation). Same results, no quoting/injection hazards.
  * Per-account database at data/<account>.db, replacing C:\\ProgramData\\OvoData.
"""
from __future__ import annotations

import sqlite3
from typing import Any

from . import config

# Fuel suffix used in table names (MonthlyElectric / MonthlyGas etc.).
_VALID_FUELS = {"Electric", "Gas"}

_SCHEMA = """
CREATE TABLE IF NOT EXISTS MonthlyElectric (Month TEXT PRIMARY KEY NOT NULL UNIQUE, Mxpn TEXT, Consumption REAL, Cost REAL);
CREATE INDEX IF NOT EXISTS Idx_MonthlyElectric ON MonthlyElectric (Month ASC);

CREATE TABLE IF NOT EXISTS MonthlyGas (Month TEXT PRIMARY KEY NOT NULL UNIQUE, Mxpn TEXT, Consumption REAL, Cost REAL);
CREATE INDEX IF NOT EXISTS Idx_MonthlyGas ON MonthlyGas (Month ASC);

CREATE TABLE IF NOT EXISTS DailyElectric (Day TEXT PRIMARY KEY NOT NULL UNIQUE, Consumption REAL, Cost REAL, Standing REAL, AnyTime REAL, Peak REAL, OffPeak REAL, HasHhData INTEGER);
CREATE INDEX IF NOT EXISTS Idx_DailyElectric ON DailyElectric (Day ASC);

CREATE TABLE IF NOT EXISTS DailyGas (Day TEXT PRIMARY KEY NOT NULL UNIQUE, Consumption REAL, Cost REAL, Standing REAL, AnyTime REAL, Peak REAL, OffPeak REAL, HasHhData INTEGER);
CREATE INDEX IF NOT EXISTS Idx_DailyGas ON DailyGas (Day ASC);

CREATE TABLE IF NOT EXISTS HalfHourlyElectric (StartTime TEXT PRIMARY KEY UNIQUE NOT NULL, Consumption REAL);
CREATE INDEX IF NOT EXISTS Idx_HalfHourlyElectric ON HalfHourlyElectric (StartTime ASC);

CREATE TABLE IF NOT EXISTS HalfHourlyGas (StartTime TEXT PRIMARY KEY UNIQUE NOT NULL, Consumption REAL);
CREATE INDEX IF NOT EXISTS Idx_HalfHourlyGas ON HalfHourlyGas (StartTime ASC);

CREATE TABLE IF NOT EXISTS SupplyPoints (Sprn TEXT PRIMARY KEY UNIQUE NOT NULL, FuelType TEXT NOT NULL, StartDate TEXT, EndDate TEXT);

CREATE TABLE IF NOT EXISTS Meters (SerialNumber TEXT PRIMARY KEY UNIQUE NOT NULL, FuelType TEXT NOT NULL, MeterType TEXT, Status TEXT);

CREATE TABLE IF NOT EXISTS MeterRegisters (StartDate TEXT NOT NULL, EndDate TEXT, FuelType TEXT NOT NULL, MeterSerialNumber TEXT NOT NULL, Id TEXT NOT NULL, TimingCategory TEXT, UnitOfMeasurement TEXT, PRIMARY KEY (StartDate ASC, MeterSerialNumber ASC, Id ASC));

CREATE TABLE IF NOT EXISTS MeterReadings (Date TEXT NOT NULL, MeterSerialNumber TEXT, FuelType TEXT NOT NULL, LifeCycle TEXT, RegisterId TEXT, Source TEXT, TimingCategory TEXT, Type TEXT, Value REAL NOT NULL, PRIMARY KEY (Date ASC, FuelType ASC, RegisterId ASC));
"""


def _proper_case(text: str) -> str:
    if not text:
        return text
    return text[0].upper() + text[1:].lower()


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


class Database:
    def __init__(self, account_id: str, log=None):
        self._log = log or (lambda _m: None)
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._path = config.DATA_DIR / f"{account_id}.db"
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA synchronous = FULL")
        return conn

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    @staticmethod
    def _fuel_table(fuel: str) -> str:
        if fuel not in _VALID_FUELS:
            raise ValueError(f"Invalid fuel suffix: {fuel!r}")
        return fuel

    # ------------------------------------------------------------- monthly
    def count_monthly(self, fuel: str, year: int) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            row = conn.execute(
                f"SELECT COUNT(1) AS c FROM Monthly{table} WHERE Month LIKE ?",
                (f"{year}%",),
            ).fetchone()
        return row["c"] if row else 0

    def upsert_monthly(self, fuel: str, items: list[dict]) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            for item in items:
                month_key = f"{int(item['year'])}-{int(item['month']):02d}"
                cost = _to_float((item.get("cost") or {}).get("amount"))
                conn.execute(
                    f"""INSERT INTO Monthly{table} (Month, Mxpn, Consumption, Cost)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(Month) DO UPDATE SET
                          Mxpn = excluded.Mxpn,
                          Consumption = excluded.Consumption,
                          Cost = excluded.Cost""",
                    (month_key, item.get("mpxn", ""), _to_float(item.get("consumption")), cost),
                )
            conn.commit()
        return len(items)

    # --------------------------------------------------------------- daily
    def count_daily(self, fuel: str, year: int, month: int) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            row = conn.execute(
                f"SELECT COUNT(1) AS c FROM Daily{table} WHERE Day LIKE ?",
                (f"{year}-{month:02d}%",),
            ).fetchone()
        return row["c"] if row else 0

    def upsert_daily(self, fuel: str, items: list[dict]) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            for item in items:
                start = (item.get("interval") or {}).get("start", "")
                day = start[:10]
                cost = _to_float((item.get("cost") or {}).get("amount"))
                rates = item.get("rates") or {}
                conn.execute(
                    f"""INSERT INTO Daily{table}
                          (Day, Consumption, Cost, Standing, AnyTime, Peak, OffPeak, HasHhData)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(Day) DO UPDATE SET
                          Consumption = excluded.Consumption,
                          Cost = excluded.Cost,
                          Standing = excluded.Standing,
                          AnyTime = excluded.AnyTime,
                          Peak = excluded.Peak,
                          OffPeak = excluded.OffPeak,
                          HasHhData = excluded.HasHhData""",
                    (
                        day,
                        _to_float(item.get("consumption")),
                        cost,
                        _to_float(rates.get("standing")),
                        _to_float(rates.get("anyTime")),
                        _to_float(rates.get("peak")),
                        _to_float(rates.get("offPeak")),
                        1 if item.get("hasHhData") else 0,
                    ),
                )
            conn.commit()
        return len(items)

    # ---------------------------------------------------------- half-hourly
    def has_half_hourly(self, fuel: str, year: int, month: int, day: int) -> bool:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            row = conn.execute(
                f"SELECT HasHhData FROM Daily{table} WHERE Day = ?",
                (f"{year}-{month:02d}-{day:02d}",),
            ).fetchone()
        return bool(row["HasHhData"]) if row and row["HasHhData"] is not None else False

    def count_half_hourly(self, fuel: str, year: int, month: int, day: int) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            row = conn.execute(
                f"SELECT COUNT(1) AS c FROM HalfHourly{table} WHERE StartTime LIKE ?",
                (f"{year}-{month:02d}-{day:02d}%",),
            ).fetchone()
        return row["c"] if row else 0

    def upsert_half_hourly(self, fuel: str, items: list[dict]) -> int:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            for item in items:
                start = (item.get("interval") or {}).get("start", "")
                timestamp = start[:19].replace("T", " ")
                conn.execute(
                    f"""INSERT INTO HalfHourly{table} (StartTime, Consumption)
                        VALUES (?, ?)
                        ON CONFLICT(StartTime) DO UPDATE SET
                          Consumption = excluded.Consumption""",
                    (timestamp, _to_float(item.get("consumption"))),
                )
            conn.commit()
        return len(items)

    # ------------------------------------------------------------- readings
    def upsert_supply_point(self, sp: dict) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO SupplyPoints (Sprn, FuelType, StartDate, EndDate)
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(Sprn) DO UPDATE SET
                     FuelType = excluded.FuelType,
                     StartDate = excluded.StartDate,
                     EndDate = excluded.EndDate""",
                (sp.get("sprn", ""), sp.get("fuelType", ""),
                 sp.get("startDate", ""), sp.get("endDate", "")),
            )
            conn.commit()

    def upsert_meter(self, meter: dict, fuel_type: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO Meters (SerialNumber, FuelType, MeterType, Status)
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(SerialNumber) DO UPDATE SET
                     FuelType = excluded.FuelType,
                     MeterType = excluded.MeterType,
                     Status = excluded.Status""",
                (meter.get("serialNumber", ""), fuel_type,
                 meter.get("fuelType", ""), meter.get("status", "")),
            )
            conn.commit()

    def upsert_meter_register(self, register: dict, fuel_type: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO MeterRegisters
                     (StartDate, EndDate, FuelType, MeterSerialNumber, Id, TimingCategory, UnitOfMeasurement)
                   VALUES (?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(StartDate, MeterSerialNumber, Id) DO UPDATE SET
                     EndDate = excluded.EndDate,
                     FuelType = excluded.FuelType,
                     TimingCategory = excluded.TimingCategory,
                     UnitOfMeasurement = excluded.UnitOfMeasurement""",
                (register.get("startDate", ""), register.get("endDate", ""), fuel_type,
                 register.get("meterSerialNumber", ""), register.get("id", ""),
                 register.get("timingCategory", ""), register.get("unitOfMeasurement", "")),
            )
            conn.commit()

    def upsert_meter_reading(self, reading: dict, fuel_type: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO MeterReadings
                     (Date, MeterSerialNumber, FuelType, LifeCycle, RegisterId, Source, TimingCategory, Type, Value)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(Date, FuelType, RegisterId) DO UPDATE SET
                     MeterSerialNumber = excluded.MeterSerialNumber,
                     LifeCycle = excluded.LifeCycle,
                     Source = excluded.Source,
                     TimingCategory = excluded.TimingCategory,
                     Type = excluded.Type,
                     Value = excluded.Value""",
                (reading.get("date", ""), reading.get("meterSerialNumber", ""), fuel_type,
                 reading.get("lifeCycle", ""), reading.get("registerId", ""), reading.get("source", ""),
                 reading.get("timingCategory", ""), reading.get("fuelType", ""),
                 _to_float(reading.get("value"))),
            )
            conn.commit()

    # ----------------------------------------------------- fetch (for export)
    def fetch_monthly(self, fuel: str) -> list[dict]:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            rows = conn.execute(
                f"SELECT Month, Consumption, Cost FROM Monthly{table} ORDER BY Month DESC"
            ).fetchall()
        return [dict(r) for r in rows]

    def fetch_daily(self, fuel: str) -> list[dict]:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            rows = conn.execute(
                f"""SELECT Day, Consumption, Cost, Standing, AnyTime, Peak, OffPeak
                    FROM Daily{table} ORDER BY Day DESC"""
            ).fetchall()
        return [dict(r) for r in rows]

    def fetch_half_hourly(self, fuel: str) -> list[dict]:
        table = self._fuel_table(fuel)
        with self._connect() as conn:
            rows = conn.execute(
                f"SELECT StartTime, Consumption FROM HalfHourly{table} ORDER BY StartTime DESC"
            ).fetchall()
        return [dict(r) for r in rows]

    def fetch_meter_registers(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT StartDate, EndDate, FuelType, TimingCategory, UnitOfMeasurement
                   FROM MeterRegisters ORDER BY StartDate DESC, FuelType ASC"""
            ).fetchall()
        return [dict(r) for r in rows]

    def fetch_meter_readings(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT Date, FuelType, TimingCategory, Value
                   FROM MeterReadings ORDER BY Date DESC, FuelType ASC"""
            ).fetchall()
        return [dict(r) for r in rows]

    # -------------------------------------------------------------- summary
    def get_usage_information(self) -> list[dict[str, str]]:
        """Port of GetUsageInformation: min/max/count per data set and fuel."""
        result: list[dict[str, str]] = []
        with self._connect() as conn:
            for fuel in ("Electric", "Gas"):
                self._metric(conn, result, "Monthly", fuel,
                             f"SELECT MAX(Month) AS mx, MIN(Month) AS mn, COUNT(1) AS c FROM Monthly{fuel}", fuel)
                self._metric(conn, result, "Daily", fuel,
                             f"SELECT MAX(Day) AS mx, MIN(Day) AS mn, COUNT(1) AS c FROM Daily{fuel}", fuel)
                self._metric(conn, result, "Half Hourly", fuel,
                             f"SELECT MAX(StartTime) AS mx, MIN(StartTime) AS mn, COUNT(1) AS c FROM HalfHourly{fuel}", fuel)
                fuel_full = config.FUEL_ELECTRICITY if fuel == "Electric" else config.FUEL_GAS
                self._metric(conn, result, "Meter Readings", fuel,
                             "SELECT MAX(Date) AS mx, MIN(Date) AS mn, COUNT(1) AS c FROM MeterReadings WHERE FuelType = ?",
                             fuel, params=(fuel_full,))
        return result

    def _metric(self, conn, result, metric, fuel, sql, display_fuel, params=()):
        row = conn.execute(sql, params).fetchone()
        if not row:
            return
        frm = ("" if row["mn"] is None else str(row["mn"]))[:16]
        to = ("" if row["mx"] is None else str(row["mx"]))[:16]
        count = row["c"] or 0
        if frm and to:
            result.append({
                "fuelType": _proper_case(display_fuel),
                "metric": metric,
                "from": frm,
                "to": to,
                "records": f"{count:,}",
            })
