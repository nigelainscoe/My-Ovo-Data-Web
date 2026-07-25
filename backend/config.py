"""Application configuration.

Ported from the original AppSettings.json. These are the OVO / Kaluza API
endpoints used by the app. `{}` placeholders are filled in by ovo_client.
"""
from pathlib import Path

# --- OVO / Kaluza API endpoints (from the original AppSettings.json) ---
LOGIN_URI = "https://my.ovoenergy.com/api/v2/auth/login"
TOKEN_URI = "https://my.ovoenergy.com/api/v2/auth/token"
ACCOUNTS_URI = "https://api.eu1.prod.kaluza.com/graphql/1"
READINGS_URI = "https://api.eu1.prod.kaluza.com/graphql/1"
# {0} = account id, {1} = date component
MONTHLY_URI = "https://smartpaymapi.ovoenergy.com/usage/api/monthly/{account}?date={date}"
DAILY_URI = "https://smartpaymapi.ovoenergy.com/usage/api/daily/{account}?date={date}"
HALF_HOURLY_URI = "https://smartpaymapi.ovoenergy.com/usage/api/half-hourly-local/{account}?date={date}"

# --- Fuel type constants ---
FUEL_ELECTRICITY = "ELECTRICITY"
FUEL_ELECTRIC = "ELECTRIC"
FUEL_GAS = "GAS"

# --- "Stop when" options (mirror the original desktop dropdown) ---
STOP_THIS_MONTH = "This Month"
STOP_TWO_MONTHS = "This Month & Last Month"
STOP_THIS_YEAR = "This Year"
STOP_ALL_TIME = "All Time"
STOP_OPTIONS = [STOP_THIS_MONTH, STOP_TWO_MONTHS, STOP_THIS_YEAR, STOP_ALL_TIME]

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RESOURCES_DIR = Path(__file__).resolve().parent / "resources"
STATIC_DIR = BASE_DIR / "static"

# Emit verbose JSON dumps to the log (equivalent to "DumpData" in AppSettings)
DUMP_DATA = False
