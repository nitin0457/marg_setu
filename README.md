# NAVIX IDR — Frontend Demo

Intelligent Dead Reckoning & GNSS Fusion — a frontend-only simulation built for an
SIH presentation. There is no backend, database, or real sensor/GNSS hardware
involved: all vehicle motion, GNSS status, drift and IMU data are simulated in
the browser.

## Stack

- React + Vite
- Tailwind CSS
- Leaflet / OpenStreetMap (via `react-leaflet`)
- Recharts

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## What to click through (demo flow)

1. Open the app — land on **NAVIX IDR**.
2. Click **Driver**.
3. Click **Start Trip** — the vehicle begins moving along the route.
4. Click **Simulate GNSS Outage** — watch `GNSS LOST` → `DEAD RECKONING ACTIVE`,
   and the drift/outage stats appear.
5. Open a second tab / click **Admin** (state resets per tab load, so for the
   live-sync demo keep everything in one browser tab and just switch screens
   with the on-screen buttons) — CAR-001 shows the same GNSS-lost / dead-reckoning
   status.
6. Back on **Driver**, click **Restore GNSS** — watch `GNSS RESTORED` →
   `GNSS + INS` → `DRIFT CORRECTED`.
7. Try **Calibrate Phone** for the 3-step calibration modal.

Driver and Admin share the same in-memory simulation state (`SimulationContext`),
so any action taken on the Driver screen is immediately reflected on the Admin
screen and vice versa — no backend required.

## Notes

- All data (routes, sensor readings, drift %, fleet statuses) is mock data
  generated on the client for demo purposes only.
- The route is drawn around a small loop in Kanpur, UP as a realistic example
  path; swap the `ROUTE` array in `src/utils/simulate.js` for any other route.
