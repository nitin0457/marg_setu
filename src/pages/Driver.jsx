import React, { useState } from 'react'

import DriverMap from '../components/DriverMap.jsx'
import CalibrationModal from '../components/CalibrationModal.jsx'
import StatusPill from '../components/StatusPill.jsx'
import ImuChart from '../components/ImuChart.jsx'
import StatCard from '../components/StatCard.jsx'

import { useSimulation } from '../context/SimulationContext.jsx'

export default function Driver({ onNavigate }) {
  const {
    activeCar: carOne,
    activeVehicleId,
    driverVehicleIds,
    switchVehicle,
    fleet,
    imu,
    chartData,
    calibration,

    startTrip,
    simulateOutage,
    restoreGnss,
    runCalibration,
  } = useSimulation()

  const [showCalibration, setShowCalibration] =
    useState(false)

  const [showVehicleSwitcher, setShowVehicleSwitcher] =
    useState(false)

  const vehicleTypeLabel = (id) => {
    if (id === 'CAR-001') return 'Car'
    const match = fleet?.find((v) => v.id === id)
    return match?.vehicleType || match?.type || 'Vehicle'
  }

  const handleSwitchVehicle = (id) => {
    if (typeof switchVehicle === 'function') {
      switchVehicle(id)
    }
    setShowVehicleSwitcher(false)
  }

  const isLost =
    carOne?.gnssStatus === 'lost'

  const tripStarted =
    Boolean(carOne?.tripStarted)

  const speed =
    Number(carOne?.speedKmh || 0)

  const heading =
    Number.isFinite(Number(carOne?.heading))
      ? Number(carOne.heading)
      : 0

  const accuracy =
    Number(carOne?.accuracy || 0)

  const aiConfidence =
    Number(carOne?.aiConfidence || 0)

  const mapMatchConfidence =
    Number(carOne?.mapMatchConfidence || 0)

  const drift =
    Number(
      carOne?.outage?.positionErrorM || 0
    )

  const outageDuration =
    Number(
      carOne?.outage?.durationS || 0
    )

  const handleStartTrip = () => {
    if (typeof startTrip === 'function') {
      startTrip()
    }
  }

  const handleSimulateOutage = () => {
    if (!tripStarted) return

    if (typeof simulateOutage === 'function') {
      simulateOutage()
    }
  }

  const handleRestoreGnss = () => {
    if (typeof restoreGnss === 'function') {
      restoreGnss()
    }
  }

  const handleCalibration = async () => {
    if (typeof runCalibration !== 'function') {
      return null
    }

    return await runCalibration()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                onNavigate('landing')
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600"
            >
              ←
            </button>

            <div>
              <div className="text-sm font-bold tracking-tight">
                NAVIX{' '}
                <span className="text-brand-400">
                  IDR
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-wider text-slate-600">
                Driver Navigation
              </div>
            </div>

          </div>

          {/* STATUS */}

          <div className="flex items-center gap-2">

            <StatusPill
              status={
                isLost
                  ? 'lost'
                  : 'connected'
              }
              mode={
                isLost
                  ? 'Dead Reckoning'
                  : 'GNSS + INS'
              }
            />

            <button
              onClick={() =>
                setShowCalibration(true)
              }
              className="hidden rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-brand-500/40 hover:text-white sm:block"
            >
              Calibrate
            </button>

            <button
              onClick={() =>
                onNavigate('admin')
              }
              className="hidden rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 sm:block"
            >
              Admin
            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">

        {/* ===================================================
            TITLE + CONTROLS
        =================================================== */}

        <section className="mb-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-xl font-semibold sm:text-2xl">
                  Driver Navigation
                </h1>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowVehicleSwitcher((v) => !v)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-300 transition hover:border-brand-500/40 hover:text-white"
                  >
                    {carOne?.id ||
                      activeVehicleId ||
                      'CAR-001'}
                    <span className="text-slate-600">
                      ▾
                    </span>
                  </button>

                  {showVehicleSwitcher && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
                      <div className="border-b border-slate-800 px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        Switch Vehicle
                      </div>

                      {(driverVehicleIds || ['CAR-001']).map(
                        (id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() =>
                              handleSwitchVehicle(id)
                            }
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${
                              id === activeVehicleId
                                ? 'bg-brand-500/10 text-brand-400'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="font-mono">
                              {id}
                            </span>

                            <span className="text-[9px] text-slate-600">
                              {vehicleTypeLabel(id)}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <span
                  className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                    isLost
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                      : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  }`}
                >
                  {isLost
                    ? 'DEAD RECKONING'
                    : 'GNSS + INS'}
                </span>

              </div>


              <p className="mt-1 text-xs text-slate-600">
                Real-time vehicle tracking with GNSS,
                IMU and dead reckoning
              </p>

            </div>


            {/* CONTROLS */}

            <div className="flex flex-wrap gap-2">

              {!tripStarted && (
                <button
                  onClick={handleStartTrip}
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 active:scale-[0.98]"
                >
                  ▶ Start Trip
                </button>
              )}

              {tripStarted && !isLost && (
                <button
                  onClick={handleSimulateOutage}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-2.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/10 active:scale-[0.98]"
                >
                  Simulate GNSS Loss
                </button>
              )}

              {isLost && (
                <button
                  onClick={handleRestoreGnss}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10 active:scale-[0.98]"
                >
                  Restore GNSS
                </button>
              )}

              <button
                onClick={() =>
                  setShowCalibration(true)
                }
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Calibrate
              </button>

            </div>

          </div>


          {/* SIMULATION BANNER */}

          {carOne?.banner && (
            <div className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-center text-xs font-semibold text-brand-300">
              {carOne.banner}
            </div>
          )}

        </section>


        {/* ===================================================
            STATS
        =================================================== */}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          <StatCard
            label="Speed"
            value={`${speed.toFixed(0)} km/h`}
            sub="Vehicle speed"
            tone="brand"
          />

          <StatCard
            label="Heading"
            value={`${Math.round(heading)}°`}
            sub={getDirection(heading)}
          />

          <StatCard
            label="Accuracy"
            value={`${accuracy.toFixed(1)} m`}
            sub={
              isLost
                ? 'INS estimated'
                : 'GNSS corrected'
            }
            tone={
              isLost
                ? 'amber'
                : 'green'
            }
          />

          <StatCard
            label="AI Confidence"
            value={`${aiConfidence.toFixed(1)}%`}
            sub="Sensor fusion"
            tone="brand"
          />

          <StatCard
            label="Map Match"
            value={`${mapMatchConfidence.toFixed(1)}%`}
            sub="Road constraint"
            tone="green"
          />

          <StatCard
            label="Navigation"
            value={
              isLost
                ? 'INS'
                : 'GNSS + INS'
            }
            sub={
              isLost
                ? `${outageDuration.toFixed(0)}s outage`
                : 'Normal'
            }
            tone={
              isLost
                ? 'amber'
                : 'green'
            }
          />

        </section>


        {/* ===================================================
            MAP + RIGHT SIDE
        =================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* =================================================
              LARGE MAP
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">

              <div>
                <div className="text-sm font-semibold text-white">
                  Live Navigation Map
                </div>

                <div className="mt-0.5 text-[10px] text-slate-600">
                  Real-time vehicle position
                </div>
              </div>

              <div
                className={`rounded-full border px-3 py-1 text-[9px] font-semibold ${
                  isLost
                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                    : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                }`}
              >
                {isLost
                  ? 'DEAD RECKONING'
                  : 'GNSS + INS'}
              </div>

            </div>


            <div className="h-[420px] sm:h-[500px] lg:h-[600px]">

              <DriverMap
                position={carOne?.position}
                truePosition={carOne?.truePosition}
                heading={heading}
                gnssStatus={
                  carOne?.gnssStatus ||
                  'connected'
                }
                showDrift={isLost}
                accuracy={accuracy}
                mode={
                  isLost
                    ? 'Dead Reckoning'
                    : 'GNSS + INS'
                }
              />

            </div>


            {/* MAP INFORMATION */}

            <div className="grid grid-cols-3 border-t border-slate-800">

              <MapInfo
                label="POSITION"
                value={
                  Array.isArray(
                    carOne?.position
                  )
                    ? `${Number(
                        carOne.position[0]
                      ).toFixed(5)}, ${Number(
                        carOne.position[1]
                      ).toFixed(5)}`
                    : '—'
                }
              />

              <MapInfo
                label="DRIFT"
                value={
                  isLost
                    ? `${drift.toFixed(1)} m`
                    : '0.0 m'
                }
              />

              <MapInfo
                label="OUTAGE"
                value={
                  isLost
                    ? `${outageDuration.toFixed(0)} s`
                    : 'None'
                }
              />

            </div>

          </div>


          {/* =================================================
              RIGHT PANEL
          ================================================= */}

          <aside className="space-y-5">

            {/* NAVIGATION STATUS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

              <div className="mb-4">

                <div className="text-sm font-semibold text-white">
                  Navigation Status
                </div>

                <div className="mt-1 text-[10px] text-slate-600">
                  Current positioning solution
                </div>

              </div>


              <div className="grid grid-cols-2 gap-2">

                <Info
                  label="GNSS"
                  value={
                    isLost
                      ? 'Lost'
                      : 'Connected'
                  }
                />

                <Info
                  label="Mode"
                  value={
                    isLost
                      ? 'INS'
                      : 'GNSS + INS'
                  }
                />

                <Info
                  label="Speed"
                  value={`${speed.toFixed(1)} km/h`}
                />

                <Info
                  label="Heading"
                  value={`${Math.round(heading)}°`}
                />

                <Info
                  label="Accuracy"
                  value={`${accuracy.toFixed(1)} m`}
                />

                <Info
                  label="AI"
                  value={`${aiConfidence.toFixed(1)}%`}
                />

              </div>

            </div>


            {/* DEAD RECKONING */}

            <div
              className={`rounded-2xl border p-4 shadow-xl ${
                isLost
                  ? 'border-amber-500/20 bg-slate-900'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >

              <div className="flex items-center justify-between">

                <div className="text-sm font-semibold text-white">
                  Dead Reckoning
                </div>

                <span
                  className={`h-2 w-2 rounded-full ${
                    isLost
                      ? 'animate-pulse bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />

              </div>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                Continue navigation using the
                inertial position estimate when
                GNSS is unavailable.
              </p>


              <div
                className={`mt-4 rounded-xl border px-3 py-3 ${
                  isLost
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="text-[10px] uppercase tracking-wider text-slate-600">
                    Current Mode
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      isLost
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isLost
                      ? 'DEAD RECKONING'
                      : 'GNSS + INS'}
                  </span>

                </div>


                {isLost && (
                  <div className="mt-3 grid grid-cols-2 gap-2">

                    <Info
                      label="Drift"
                      value={`${drift.toFixed(1)} m`}
                    />

                    <Info
                      label="Outage"
                      value={`${outageDuration.toFixed(0)} s`}
                    />

                  </div>
                )}

              </div>


              {!isLost && tripStarted && (
                <button
                  onClick={handleSimulateOutage}
                  className="mt-3 w-full rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/10"
                >
                  Simulate GNSS Loss
                </button>
              )}


              {isLost && (
                <button
                  onClick={handleRestoreGnss}
                  className="mt-3 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  Restore GNSS
                </button>
              )}

            </div>

          </aside>

        </section>


        {/* ===================================================
            IMU CHART
        =================================================== */}

        <section className="mt-5">

          <ImuChart
            data={chartData || []}
          />

        </section>


        {/* ===================================================
            SENSOR VALUES
        =================================================== */}

        <section className="mt-5 grid gap-4 md:grid-cols-2">

          <SensorPanel
            title="Accelerometer"
            values={imu?.accel}
          />

          <SensorPanel
            title="Gyroscope"
            values={imu?.gyro}
          />

        </section>


        <footer className="mt-6 border-t border-slate-900 py-5 text-center text-[10px] text-slate-700">
          NAVIX IDR • GNSS + INS • AI Sensor Fusion • Dead Reckoning
        </footer>

      </main>


      {/* CALIBRATION */}

      {showCalibration && (
        <CalibrationModal
          onClose={() =>
            setShowCalibration(false)
          }
          onRun={handleCalibration}
          result={calibration}
          compassAvailable={false}
          compassActive={false}
        />
      )}

    </div>
  )
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MapInfo({ label, value }) {
  return (
    <div className="min-w-0 border-r border-slate-800 px-3 py-3 last:border-r-0">

      <div className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate font-mono text-[10px] font-semibold text-slate-400">
        {value}
      </div>

    </div>
  )
}


function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">

      <div className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-semibold text-slate-300">
        {value}
      </div>

    </div>
  )
}


function SensorPanel({ title, values }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">

      <div className="flex items-center justify-between">

        <div className="text-sm font-semibold text-white">
          {title}
        </div>

        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">

        <SensorValue
          label="X"
          value={values?.x}
        />

        <SensorValue
          label="Y"
          value={values?.y}
        />

        <SensorValue
          label="Z"
          value={values?.z}
        />

      </div>

    </div>
  )
}


function SensorValue({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">

      <div className="text-[9px] text-slate-600">
        {label}
      </div>

      <div className="mt-1 font-mono text-sm font-semibold text-slate-300">
        {Number(value || 0).toFixed(2)}
      </div>

    </div>
  )
}


function getDirection(degrees) {
  const value =
    ((Number(degrees) || 0) + 360) % 360

  if (value >= 337.5 || value < 22.5)
    return 'N'

  if (value < 67.5)
    return 'NE'

  if (value < 112.5)
    return 'E'

  if (value < 157.5)
    return 'SE'

  if (value < 202.5)
    return 'S'

  if (value < 247.5)
    return 'SW'

  if (value < 292.5)
    return 'W'

  return 'NW'
}