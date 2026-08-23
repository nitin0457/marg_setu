import React from 'react'

function AxisRow({ axis, value, unit = '' }) {
  const safeValue = Number(value) || 0

  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[9px] font-semibold text-slate-500">
          {axis}
        </span>

        <span className="text-[11px] text-slate-500">
          {axis === 'X'
            ? 'Longitudinal'
            : axis === 'Y'
              ? 'Lateral'
              : 'Vertical'}
        </span>
      </div>

      <span className="font-mono text-xs font-medium text-slate-300">
        {safeValue.toFixed(2)}
        {unit && (
          <span className="ml-1 text-[9px] text-slate-600">
            {unit}
          </span>
        )}
      </span>

    </div>
  )
}

/* =========================================================
   SENSOR ICON
========================================================= */

function SensorIcon({ type }) {
  if (type === 'accelerometer') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
        <span className="text-sm">✣</span>
      </div>
    )
  }

  if (type === 'gyroscope') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        <span className="text-sm">◉</span>
      </div>
    )
  }

  if (type === 'speed') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
        <span className="text-sm">↗</span>
      </div>
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
      <span className="text-sm">◎</span>
    </div>
  )
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2.5">

        {icon}

        <div>
          <div className="text-xs font-semibold text-slate-300">
            {title}
          </div>

          <div className="mt-0.5 text-[9px] text-slate-600">
            {subtitle}
          </div>
        </div>

      </div>

      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

    </div>
  )
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SensorCards({
  accel = { x: 0, y: 0, z: 0 },
  gyro = { x: 0, y: 0, z: 0 },
  speedKmh = 0,
  heading = 0,
}) {
  const safeSpeed = Number(speedKmh) || 0
  const safeHeading = Number(heading) || 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

      {/* ===================================================
          ACCELEROMETER
      =================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

        <CardHeader
          icon={<SensorIcon type="accelerometer" />}
          title="Accelerometer"
          subtitle="Linear acceleration"
        />

        <div className="mt-4 space-y-2.5">

          <AxisRow
            axis="X"
            value={accel.x}
            unit="m/s²"
          />

          <AxisRow
            axis="Y"
            value={accel.y}
            unit="m/s²"
          />

          <AxisRow
            axis="Z"
            value={accel.z}
            unit="m/s²"
          />

        </div>

        <div className="mt-4 border-t border-slate-800 pt-3">

          <div className="flex items-center justify-between">

            <span className="text-[9px] uppercase tracking-wider text-slate-600">
              Sensor status
            </span>

            <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ACTIVE
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          GYROSCOPE
      =================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

        <CardHeader
          icon={<SensorIcon type="gyroscope" />}
          title="Gyroscope"
          subtitle="Angular velocity"
        />

        <div className="mt-4 space-y-2.5">

          <AxisRow
            axis="X"
            value={gyro.x}
            unit="°/s"
          />

          <AxisRow
            axis="Y"
            value={gyro.y}
            unit="°/s"
          />

          <AxisRow
            axis="Z"
            value={gyro.z}
            unit="°/s"
          />

        </div>

        <div className="mt-4 border-t border-slate-800 pt-3">

          <div className="flex items-center justify-between">

            <span className="text-[9px] uppercase tracking-wider text-slate-600">
              Sensor status
            </span>

            <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ACTIVE
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          SPEED
      =================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

        <CardHeader
          icon={<SensorIcon type="speed" />}
          title="Vehicle Speed"
          subtitle="Current estimated speed"
        />

        <div className="mt-5 flex items-end gap-2">

          <span className="font-mono text-3xl font-semibold tracking-tight text-white">
            {safeSpeed.toFixed(0)}
          </span>

          <span className="mb-1 text-xs text-slate-600">
            km/h
          </span>

        </div>

        {/* Speed bar */}
        <div className="mt-4">

          <div className="mb-1.5 flex justify-between">

            <span className="text-[9px] text-slate-600">
              Velocity
            </span>

            <span className="text-[9px] text-slate-600">
              0–120 km/h
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (safeSpeed / 120) * 100,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-4 border-t border-slate-800 pt-3">

          <div className="flex items-center justify-between">

            <span className="text-[9px] uppercase tracking-wider text-slate-600">
              Measurement
            </span>

            <span className="text-[9px] font-medium text-emerald-400">
              LIVE
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          HEADING
      =================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

        <CardHeader
          icon={<SensorIcon type="heading" />}
          title="Heading"
          subtitle="Vehicle orientation"
        />

        <div className="mt-4 flex items-center gap-4">

          {/* Compass */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950">

            {/* Compass ring */}
            <div className="absolute inset-1 rounded-full border border-slate-800" />

            {/* North */}
            <span className="absolute top-1 text-[8px] font-semibold text-slate-500">
              N
            </span>

            {/* South */}
            <span className="absolute bottom-1 text-[8px] text-slate-700">
              S
            </span>

            {/* West */}
            <span className="absolute left-1 text-[8px] text-slate-700">
              W
            </span>

            {/* East */}
            <span className="absolute right-1 text-[8px] text-slate-700">
              E
            </span>

            {/* Needle */}
            <div
              className="absolute h-10 w-0.5 origin-bottom rounded-full bg-amber-400 transition-transform duration-500"
              style={{
                transform: `rotate(${safeHeading}deg)`,
              }}
            />

            <div className="z-10 h-2 w-2 rounded-full border border-slate-950 bg-amber-400" />

          </div>

          <div>

            <div className="font-mono text-2xl font-semibold text-white">
              {safeHeading.toFixed(0)}
              <span className="ml-1 text-sm text-slate-600">
                °
              </span>
            </div>

            <div className="mt-1 text-[10px] text-slate-600">
              Vehicle orientation
            </div>

          </div>

        </div>

        <div className="mt-4 border-t border-slate-800 pt-3">

          <div className="flex items-center justify-between">

            <span className="text-[9px] uppercase tracking-wider text-slate-600">
              Compass
            </span>

            <span className="text-[9px] font-medium text-amber-400">
              {getDirection(safeHeading)}
            </span>

          </div>

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   HEADING DIRECTION
========================================================= */

function getDirection(degrees) {
  const normalized = ((degrees % 360) + 360) % 360

  if (normalized >= 337.5 || normalized < 22.5) return 'N'
  if (normalized < 67.5) return 'NE'
  if (normalized < 112.5) return 'E'
  if (normalized < 157.5) return 'SE'
  if (normalized < 202.5) return 'S'
  if (normalized < 247.5) return 'SW'
  if (normalized < 292.5) return 'W'

  return 'NW'
}