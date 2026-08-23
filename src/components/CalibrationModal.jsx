import React, { useState } from 'react'

const STEPS = [
  'Keep phone stationary',
  'Align phone with vehicle',
  'Calibrating IMU sensors',
  'Calibration complete',
]

export default function CalibrationModal({
  onClose,
  onRun,
  result,
  compassAvailable = false,
  compassActive = false,
  onEnableCompass,
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(Boolean(result))
  const [error, setError] = useState('')

  const startCalibration = async () => {
    if (running) return

    try {
      setError('')
      setRunning(true)
      setDone(false)
      setStepIndex(0)

      // Step 1
      await wait(800)
      setStepIndex(1)

      // Step 2
      await wait(800)
      setStepIndex(2)

      // Actual calibration is handled by parent/context
      const calibrationResult = await onRun()

      if (!calibrationResult) {
        throw new Error('No calibration result returned')
      }

      // Step 4
      setStepIndex(3)

      await wait(500)

      setRunning(false)
      setDone(true)
    } catch (err) {
      console.error('Calibration failed:', err)

      setRunning(false)

      setError(
        err?.message ||
          'Calibration could not be completed. Please try again.'
      )
    }
  }

  const enableCompass = async () => {
    if (!onEnableCompass) return

    try {
      setError('')
      await onEnableCompass()
    } catch (err) {
      console.error('Compass permission failed:', err)

      setError(
        'Unable to enable the phone compass. Please allow motion/orientation permission.'
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">

          <div>
            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                🧭
              </div>

              <h2 className="text-base font-semibold text-white">
                Phone Calibration
              </h2>

            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Calibrate the smartphone IMU and determine
              its orientation relative to the vehicle.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✕
          </button>

        </div>

        {/* Sensor status */}
        <div className="px-5 pt-5">

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] uppercase tracking-wider text-slate-600">
                  Orientation Sensor
                </div>

                <div className="mt-1 text-xs font-medium text-slate-300">
                  {compassActive
                    ? 'Phone compass active'
                    : compassAvailable
                    ? 'Permission required'
                    : 'Browser fallback mode'}
                </div>

              </div>

              <span
                className={`h-2 w-2 rounded-full ${
                  compassActive
                    ? 'animate-pulse bg-emerald-400'
                    : compassAvailable
                    ? 'bg-amber-400'
                    : 'bg-slate-600'
                }`}
              />

            </div>

            {/* Enable compass */}
            {compassAvailable && !compassActive && (
              <button
                type="button"
                onClick={enableCompass}
                disabled={running}
                className="mt-3 w-full rounded-lg border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-400 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enable Phone Compass
              </button>
            )}

            {/* Active compass */}
            {compassActive && (
              <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-[10px] text-emerald-400">
                ✓ Device orientation sensor is receiving data
              </div>
            )}

          </div>

        </div>

        {/* Calibration steps */}
        <div className="px-5 pt-5">

          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Calibration Process
          </div>

          <ol className="space-y-3">

            {STEPS.map((label, index) => {

              const isCompleted =
                index < stepIndex || done

              const isActive =
                index === stepIndex && running

              return (
                <li
                  key={label}
                  className="flex items-center gap-3"
                >

                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isCompleted
                      ? '✓'
                      : index + 1}
                  </span>

                  <span
                    className={`text-sm ${
                      isCompleted || isActive
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                  )}

                </li>
              )
            })}

          </ol>

        </div>

        {/* Result */}
        {done && result && (
          <div className="mx-5 mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">

            <div className="border-b border-slate-800 px-3 py-2">

              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Calibration Result
              </div>

            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-800">

              <Metric
                label="Pitch"
                value={result.pitch}
                suffix="°"
              />

              <Metric
                label="Roll"
                value={result.roll}
                suffix="°"
              />

              <Metric
                label="Yaw"
                value={result.yaw}
                suffix="°"
              />

            </div>

            <div className="border-t border-slate-800 px-3 py-2 text-center">

              <span className="text-[10px] text-slate-600">
                Source:{' '}
              </span>

              <span className="text-[10px] font-medium text-emerald-400">
                {result.source || 'Device IMU'}
              </span>

            </div>

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs leading-relaxed text-red-400">
            {error}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex gap-2 p-5">

          {!done ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={running}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startCalibration}
                disabled={running}
                className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running
                  ? 'Calibrating…'
                  : 'Start Calibration'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Done
            </button>
          )}

        </div>

      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  suffix,
}) {
  const numericValue = Number(value)

  return (
    <div className="px-3 py-4 text-center">

      <div className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 font-mono text-lg font-semibold text-white">
        {Number.isFinite(numericValue)
          ? numericValue.toFixed(1)
          : '0.0'}
        {suffix}
      </div>

    </div>
  )
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}