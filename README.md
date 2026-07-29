# My OVO Data — web edition

A local web-app port of [My-Ovo-Data](https://github.com/MikeWilliams-UK/My-Ovo-Data),
originally a Windows WPF/C# desktop application. It logs into the OVO Energy API,
pulls your smart-meter **usage** (monthly, daily, half-hourly) and **meter
readings** into a per-account SQLite database, and shows a summary of what's stored.

A big shout-out to [@MikeWilliams-UK](https://github.com/MikeWilliams-UK) for the original work that enabled me to quickly port this.

> **Unofficial.** Not affiliated with OVO Energy. Use at your own risk. This runs
> entirely on your own machine — credentials are held in memory only and never
> written to disk.

## What changed from the original

| Original (C#) | This port (Python) |
|---|---|
| WPF desktop UI | FastAPI backend + single-page HTML/JS UI in the browser |
| `HttpHelper` / `JwtHelper` | `backend/ovo_client.py` (requests + PyJWT) |
| `SqLiteHelper` + `.sql` migrations | `backend/database.py` (sqlite3, consolidated schema, parameterised) |
| Data in `C:\ProgramData\OvoData` | `./data/<account>.db` (cross-platform) |
| Credentials in Windows Registry | in-memory only, entered each session |
| CSV / Excel export | **Export** section: Excel (.xlsx, 5 sheets) or a ZIP of 4 CSVs |

The scope is **data pull + summary + export**. The SQLite schema is unchanged, so a
database created by the original desktop app opens here as-is, and files written
here are readable by the original app.

## Requirements

- Python 3.10+

## Run

```bash
cd My-Ovo-Data-Web
./run.sh
```

Or manually:

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.app:app --port 8000
```

Then open <http://127.0.0.1:8000>.

## Using it

1. **Log in** with your OVO username and password.
2. Pick an **account** (date ranges for each fuel are shown).
3. Choose how far back to fetch under **Fetch back to**:
   - *This Month*, *This Month & Last Month*, *This Year*, or *All Time*.
   - The first run for an account should use **All Time**; later runs a shorter range.
4. Click **Get Usage** and/or **Get Readings**. Live progress appears below; you
   can **Cancel** at any point.
5. The **summary table** shows the date span and row count stored for each data set.
6. Use **Export** to download an Excel workbook (`Monthly`, `Monthly Chart`, `Daily`, `Half Hourly`, `Meter Readings`) or a ZIP of the same data as four CSV files.

## Where your data lives

`data/<account-id>.db` — a standard SQLite file. Inspect it with any SQLite tool,
for example:

```bash
sqlite3 data/<account-id>.db "SELECT * FROM DailyElectric ORDER BY Day DESC LIMIT 10;"
```

### Tables

`MonthlyElectric` · `MonthlyGas` · `DailyElectric` · `DailyGas` ·
`HalfHourlyElectric` · `HalfHourlyGas` · `SupplyPoints` · `Meters` ·
`MeterRegisters` · `MeterReadings`

## Notes on the API

- Login returns a `restricted_refresh_token` cookie (~30 min). It's exchanged at
  the token endpoint for a short-lived access token (~60 s). The client refreshes
  tokens automatically before each call during long fetches — the same logic as
  the original `CheckTokens()`.
- Endpoints are defined in `backend/config.py` (ported from the original
  `AppSettings.json`).

## Project layout

```
My-Ovo-Data-Web/
├── backend/
│   ├── app.py             FastAPI routes + background fetch orchestration
│   ├── ovo_client.py      OVO/Kaluza API client (login, usage, readings)
│   ├── database.py        SQLite schema + upserts + summary + fetch
│   ├── export.py          CSV / Excel builders
│   ├── config.py          endpoints & constants (was AppSettings.json)
│   └── resources/graphql/ accounts.query, readings.query
├── static/                index.html, app.js, style.css, tokens.css, fonts.css
│   └── fonts/             self-hosted woff2 files (no CDN calls at runtime)
├── public/                favicon.svg, favicon-48.png (served from the root)
├── data/                  SQLite databases (created at runtime)
├── requirements.txt
└── run.sh
```

## License

Licensed under the Apache License 2.0 — see [LICENSE](LICENSE).

This project is a Python/web port of [MikeWilliams-UK/My-Ovo-Data](https://github.com/MikeWilliams-UK/My-Ovo-Data) (also Apache 2.0). Not affiliated with or endorsed by OVO Energy.

The bundled webfonts in `static/fonts/` (Space Grotesk, JetBrains Mono,
Instrument Serif) are third-party software under the SIL Open Font License 1.1 —
see [static/fonts/OFL.txt](static/fonts/OFL.txt). They're vendored rather than
loaded from a CDN so the app makes no outbound requests other than to the OVO
API itself.
