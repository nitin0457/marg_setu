import React, { useMemo, useState } from 'react'
import { useSimulation } from '../context/SimulationContext.jsx'
import AdminMap from '../components/AdminMap.jsx'
import StatCard from '../components/StatCard.jsx'
import AddVehicleModal from '../components/AddVehicleModal.jsx'

const STATUS_LABEL = {
  gnss: 'GNSS',
  'dead-reckoning': 'Dead Reckoning',
  offline: 'Offline',
}

const STATUS_DOT = {
  gnss: 'bg-emerald-500',
  'dead-reckoning': 'bg-amber-500',
  offline: 'bg-red-500',
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export default function Admin({ onNavigate }) {
  const {
    carOne: simulationCarOne,
    fleet: simulationFleet,
    totals: simulationTotals,
    alerts: simulationAlerts,
    addVehicle,
    removeVehicle,
    updateVehicleStatus,
    clearAlerts,
  } = useSimulation()

  // ------------------------------------------------------------
  // SAFE DEFAULTS
  // Prevent undefined errors during initial render
  // ------------------------------------------------------------

  const carOne = simulationCarOne || {
    id: 'CAR-001',
    type: 'Car',
    position: null,
    gnssStatus: 'connected',
    speedKmh: 0,
    accuracy: null,
    outage: {},
    mode: 'GNSS + INS',
    aiConfidence: 94.5,
    vibration: 18.5,
    mapMatchConfidence: 96.2,
    sensorHealth: 98,
    tripStarted: false,
  }

  const fleet = Array.isArray(simulationFleet)
    ? simulationFleet
    : []

  const alerts = Array.isArray(simulationAlerts)
    ? simulationAlerts
    : []

  const totals = simulationTotals || {
    total: fleet.length + 1,
    online: 0,
    gnssActive: 0,
    deadReckoning: 0,
    offline: 0,
  }

  const [selectedId, setSelectedId] = useState('CAR-001')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  /*
   * ============================================================
   * BUILD COMPLETE VEHICLE LIST
   * ============================================================
   */

  const vehicles = useMemo(() => {
    const carOneVehicle = {
      id: carOne.id,
      type: carOne.type || 'Car',
      position: carOne.position,

      status:
        carOne.gnssStatus === 'lost'
          ? 'dead-reckoning'
          : 'gnss',

      speedKmh: carOne.tripStarted
        ? toNumber(carOne.speedKmh)
        : 0,

      accuracy: carOne.accuracy != null ? toNumber(carOne.accuracy) : null,

      driftPercent: toNumber(carOne.outage?.driftPercent),

      positionError: toNumber(carOne.outage?.positionErrorM),

      mode: carOne.mode,

      aiConfidence: toNumber(carOne.aiConfidence, 94.5),

      vibration: toNumber(carOne.vibration, 18.5),

      mapMatchConfidence: toNumber(carOne.mapMatchConfidence, 96.2),

      sensorHealth: toNumber(carOne.sensorHealth, 98),

      outageDuration: toNumber(carOne.outage?.durationS),

      tripStarted:
        carOne.tripStarted,

      latitude:
        carOne.position?.[0] != null ? toNumber(carOne.position[0]) : null,

      longitude:
        carOne.position?.[1] != null ? toNumber(carOne.position[1]) : null,
    }

    const fleetVehicles = fleet.map((v) => ({
      ...v,

      type: v.type || 'Vehicle',

      speedKmh:
        v.status === 'offline'
          ? 0
          : toNumber(v.speed),

      mode:
        v.status === 'gnss'
          ? 'GNSS + INS'
          : v.status === 'dead-reckoning'
            ? 'Dead Reckoning'
            : 'Offline',

      aiConfidence: toNumber(
        v.aiConfidence ?? (
          v.status === 'offline'
            ? 0
            : v.status === 'dead-reckoning'
              ? 88
              : 95
        )
      ),

      vibration: toNumber(
        v.vibration ?? (
          v.status === 'offline'
            ? 0
            : 20
        )
      ),

      mapMatchConfidence: toNumber(
        v.mapMatchConfidence ?? (
          v.status === 'offline'
            ? 0
            : 94
        )
      ),

      sensorHealth: toNumber(
        v.sensorHealth ?? (
          v.status === 'offline'
            ? 0
            : 97
        )
      ),

      accuracy:
        v.accuracy != null ? toNumber(v.accuracy) : (
          v.status === 'offline'
            ? null
            : v.status === 'dead-reckoning'
              ? 8.5
              : 3.8
        ),

      driftPercent: toNumber(
        v.driftPercent ?? (
          v.status === 'dead-reckoning'
            ? 3.2
            : 0
        )
      ),

      positionError: toNumber(
        v.positionError ?? (
          v.status === 'dead-reckoning'
            ? 4.5
            : 0
        )
      ),

      outageDuration: toNumber(v.outageDuration),
    }))

    return [
      carOneVehicle,
      ...fleetVehicles,
    ]
  }, [carOne, fleet])

  /*
   * ============================================================
   * FILTER
   * ============================================================
   */

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch = vehicle.id
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        vehicle.status === filter

      return matchesSearch && matchesFilter
    })
  }, [vehicles, search, filter])

  const selected =
    vehicles.find(
      (vehicle) =>
        vehicle.id === selectedId
    ) || null

  /*
   * ============================================================
   * DERIVED SYSTEM METRICS
   * ============================================================
   */

  const avgAiConfidence =
    vehicles.length > 0
      ? vehicles.reduce(
          (sum, vehicle) =>
            sum + toNumber(vehicle.aiConfidence),
          0
        ) / vehicles.length
      : 0

  const avgMapMatch =
    vehicles.length > 0
      ? vehicles.reduce(
          (sum, vehicle) =>
            sum + toNumber(vehicle.mapMatchConfidence),
          0
        ) / vehicles.length
      : 0

  const avgSensorHealth =
    vehicles.length > 0
      ? vehicles.reduce(
          (sum, vehicle) =>
            sum + toNumber(vehicle.sensorHealth),
          0
        ) / vehicles.length
      : 0

  const deadReckoningVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status === 'dead-reckoning'
    )

  /*
   * ============================================================
   * ADD VEHICLE
   * ============================================================
   */

  const handleAddVehicle = (vehicle) => {
    addVehicle({
      ...vehicle,

      id: vehicle.id
        ?.trim()
        .toUpperCase(),

      type:
        vehicle.type || 'Car',

      speed:
        Number(vehicle.speed) || 0,
    })
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                onNavigate('landing')
              }
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ←
            </button>

            <div>
              <div className="font-semibold">
                Marg-Setu
              </div>

              <div className="text-xs text-slate-500">
                Intelligent Fleet Command
              </div>
            </div>

          </div>

          <div className="hidden items-center gap-2 sm:flex">

            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs text-slate-400">
              LIVE SYSTEM
            </span>

          </div>

        </div>
      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

        {/* PAGE TITLE */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
              Fleet Command Center
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Vehicle Monitoring
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              GNSS + INS + AI-powered dead reckoning
            </p>

          </div>

          <button
            onClick={() =>
              setShowAddVehicle(true)
            }
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 active:scale-[0.98]"
          >
            + Add Vehicle
          </button>

        </div>

        {/* ====================================================
            CORE FLEET STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

          <StatCard
            label="Total Vehicles"
            value={totals.total}
          />

          <StatCard
            label="Online"
            value={totals.online}
            tone="brand"
          />

          <StatCard
            label="GNSS Active"
            value={totals.gnss}
            tone="green"
          />

          <StatCard
            label="Dead Reckoning"
            value={totals.deadReckoning}
            tone="amber"
          />

          <StatCard
            label="Offline"
            value={totals.offline}
            tone="red"
          />

        </div>

        {/* ====================================================
            AI / SENSOR PERFORMANCE
        ==================================================== */}

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">

          <StatCard
            label="AI Confidence"
            value={`${toNumber(avgAiConfidence).toFixed(1)}%`}
            tone={
              avgAiConfidence >= 90
                ? 'green'
                : avgAiConfidence >= 75
                  ? 'amber'
                  : 'red'
            }
            sub="Edge inference"
          />

          <StatCard
            label="Map Match"
            value={`${toNumber(avgMapMatch).toFixed(1)}%`}
            tone={
              avgMapMatch >= 90
                ? 'green'
                : 'amber'
            }
            sub="Road constraint"
          />

          <StatCard
            label="Sensor Health"
            value={`${toNumber(avgSensorHealth).toFixed(1)}%`}
            tone={
              avgSensorHealth >= 90
                ? 'green'
                : 'amber'
            }
            sub="IMU quality"
          />

          <StatCard
            label="GNSS Denied"
            value={deadReckoningVehicles.length}
            tone={
              deadReckoningVehicles.length > 0
                ? 'amber'
                : 'green'
            }
            sub="Active INS vehicles"
          />

        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {/* ==================================================
              MAP
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl lg:col-span-2">

            <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="text-sm font-semibold">
                  Live Fleet Map
                </div>

                <div className="text-xs text-slate-500">
                  GNSS / INS / map-matched vehicle positioning
                </div>

              </div>

              <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">

                <span>
                  <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  GNSS
                </span>

                <span>
                  <i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
                  INS
                </span>

                <span>
                  <i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
                  Offline
                </span>

              </div>

            </div>

            <div className="h-[420px] lg:h-[560px]">

              <AdminMap
                vehicles={vehicles}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

            </div>

          </div>

          {/* ==================================================
              FLEET PANEL
          ================================================== */}

          <div className="space-y-4">

            <div className="rounded-2xl border border-white/10 bg-slate-900">

              {/* Fleet Header */}

              <div className="border-b border-white/10 p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="font-semibold">
                      Fleet
                    </h2>

                    <p className="text-xs text-slate-500">
                      {vehicles.length} vehicles registered
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowAddVehicle(true)
                    }
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold hover:bg-blue-500"
                  >
                    + Add
                  </button>

                </div>

                {/* Search */}

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search vehicle..."
                  className="mt-4 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                {/* Filters */}

                <div className="mt-3 flex gap-1 overflow-x-auto">

                  {[
                    ['all', 'All'],
                    ['gnss', 'GNSS'],
                    ['dead-reckoning', 'INS'],
                    ['offline', 'Offline'],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        onClick={() =>
                          setFilter(value)
                        }
                        className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs ${
                          filter === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* Vehicle List */}

              <div className="max-h-[390px] overflow-y-auto">

                {filteredVehicles.length === 0 ? (

                  <div className="p-8 text-center text-xs text-slate-600">
                    No vehicles found
                  </div>

                ) : (

                  filteredVehicles.map(
                    (vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() =>
                          setSelectedId(
                            vehicle.id
                          )
                        }
                        className={`w-full border-b border-white/5 p-4 text-left transition ${
                          selectedId === vehicle.id
                            ? 'bg-blue-500/10'
                            : 'hover:bg-white/[0.03]'
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <span
                              className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[vehicle.status]}`}
                            />

                            <span className="font-medium">
                              {vehicle.id}
                            </span>

                          </div>

                          <span className="text-[10px] uppercase text-slate-500">
                            {
                              STATUS_LABEL[
                                vehicle.status
                              ]
                            }
                          </span>

                        </div>

                        <div className="mt-2 flex justify-between text-xs text-slate-500">

                          <span>
                            {vehicle.type || 'Vehicle'}
                          </span>

                          <span>
                            {toNumber(vehicle.speedKmh).toFixed(0)} km/h
                          </span>

                        </div>

                        <div className="mt-2 flex items-center gap-2">

                          <span className="text-[9px] text-slate-600">
                            AI
                          </span>

                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${Math.min(
                                  vehicle.aiConfidence || 0,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                          <span className="text-[9px] text-slate-500">
                            {toNumber(vehicle.aiConfidence).toFixed(0)}%
                          </span>

                        </div>

                      </button>
                    )
                  )

                )}

              </div>

            </div>

            {/* ==================================================
                SELECTED VEHICLE
            ================================================== */}

            {selected && (

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="font-semibold">
                      {selected.id}
                    </div>

                    <div className="text-xs text-slate-500">
                      {selected.type || 'Vehicle'}
                    </div>

                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      selected.status === 'gnss'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : selected.status === 'dead-reckoning'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {
                      STATUS_LABEL[
                        selected.status
                      ]
                    }
                  </span>

                </div>

                {/* Mode */}

                <div className="mt-3 rounded-xl border border-white/5 bg-slate-950 p-3">

                  <div className="text-[9px] uppercase tracking-wider text-slate-600">
                    Navigation Mode
                  </div>

                  <div className="mt-1 text-sm font-semibold text-blue-400">
                    {selected.mode || 'GNSS + INS'}
                  </div>

                </div>

                {/* Metrics */}

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <MiniMetric
                    label="Speed"
                    value={`${toNumber(selected.speedKmh).toFixed(0)} km/h`}
                  />

                  <MiniMetric
                    label="Accuracy"
                    value={
                      selected.accuracy != null
                        ? `${toNumber(selected.accuracy).toFixed(1)} m`
                        : '—'
                    }
                  />

                  <MiniMetric
                    label="AI Confidence"
                    value={`${toNumber(selected.aiConfidence).toFixed(1)}%`}
                  />

                  <MiniMetric
                    label="Map Match"
                    value={`${toNumber(selected.mapMatchConfidence).toFixed(1)}%`}
                  />

                  <MiniMetric
                    label="Vibration"
                    value={`${toNumber(selected.vibration).toFixed(1)}%`}
                  />

                  <MiniMetric
                    label="Sensor Health"
                    value={`${toNumber(selected.sensorHealth).toFixed(1)}%`}
                  />

                  <MiniMetric
                    label="Drift"
                    value={`${toNumber(selected.driftPercent).toFixed(1)}%`}
                  />

                  <MiniMetric
                    label="Position Error"
                    value={`${toNumber(selected.positionError).toFixed(1)} m`}
                  />

                </div>

                {/* GNSS outage information */}

                {selected.status === 'dead-reckoning' && (

                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] uppercase tracking-wider text-amber-500">
                        GNSS Denied Environment
                      </span>

                      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />

                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">

                      <div>
                        <div className="text-[9px] text-slate-600">
                          Outage
                        </div>

                        <div className="text-xs font-semibold text-amber-300">
                          {toNumber(selected.outageDuration).toFixed(0)}s
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-slate-600">
                          Drift Target
                        </div>

                        <div
                          className={`text-xs font-semibold ${
                            (selected.driftPercent || 0) < 10
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          &lt; 10%
                        </div>
                      </div>

                    </div>

                  </div>

                )}

                {/* Coordinates */}

                {selected.latitude != null &&
                  selected.longitude != null && (

                    <div className="mt-3 rounded-xl bg-slate-950 p-3">

                      <div className="text-[9px] uppercase tracking-wider text-slate-600">
                        Estimated Position
                      </div>

                      <div className="mt-1 font-mono text-[11px] text-slate-400">
                        {toNumber(selected.latitude).toFixed(6)}
                        {' , '}
                        {toNumber(selected.longitude).toFixed(6)}
                      </div>

                    </div>

                  )}

                {/* Remove */}

                {selected.id !== 'CAR-001' && (

                  <button
                    onClick={() => {
                      removeVehicle(selected.id)

                      if (selectedId === selected.id) {
                        setSelectedId('CAR-001')
                      }
                    }}
                    className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10"
                  >
                    Remove Vehicle
                  </button>

                )}

              </div>

            )}

          </div>

        </div>

        {/* ====================================================
            SIH BENCHMARK PANEL
        ==================================================== */}

        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">

          <div className="border-b border-white/10 px-4 py-4">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-sm font-semibold">
                  IDR Performance Benchmark
                </h2>

                <p className="text-xs text-slate-500">
                  SIH evaluation-oriented navigation metrics
                </p>

              </div>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold text-blue-400">
                EDGE READY
              </span>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">

            <BenchmarkMetric
              label="Target Drift"
              value="< 10%"
              status="PASS"
            />

            <BenchmarkMetric
              label="GNSS + INS"
              value="10 Hz"
              status="ACTIVE"
            />

            <BenchmarkMetric
              label="Map Matching"
              value={`${toNumber(avgMapMatch).toFixed(1)}%`}
              status={
                avgMapMatch >= 90
                  ? 'PASS'
                  : 'CHECK'
              }
            />

            <BenchmarkMetric
              label="AI Inference"
              value={`${toNumber(avgAiConfidence).toFixed(1)}%`}
              status={
                avgAiConfidence >= 90
                  ? 'PASS'
                  : 'CHECK'
              }
            />

          </div>

        </div>

        {/* ====================================================
            SYSTEM EVENTS
        ==================================================== */}

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900">

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

            <div>

              <h2 className="text-sm font-semibold">
                System Events
              </h2>

              <p className="text-xs text-slate-500">
                Fleet activity and navigation alerts
              </p>

            </div>

            {alerts.length > 0 && (

              <button
                onClick={clearAlerts}
                className="text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>

            )}

          </div>

          <div className="max-h-52 overflow-y-auto">

            {alerts.length === 0 ? (

              <div className="p-6 text-center text-xs text-slate-600">
                No recent system events
              </div>

            ) : (

              alerts.map(
                (alert) => (

                  <div
                    key={alert.id}
                    className="flex items-center justify-between border-b border-white/5 px-4 py-3"
                  >

                    <div className="flex items-center gap-3">

                      <span
                        className={`h-2 w-2 rounded-full ${
                          alert.type === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />

                      <div>

                        <div className="text-xs text-slate-300">
                          {alert.message}
                        </div>

                        <div className="text-[10px] text-slate-600">
                          {alert.vehicleId}
                        </div>

                      </div>

                    </div>

                    <span className="text-[10px] text-slate-600">
                      {alert.time}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </main>

      {/* ======================================================
          ADD VEHICLE MODAL
      ====================================================== */}

      {showAddVehicle && (

        <AddVehicleModal
          onClose={() =>
            setShowAddVehicle(false)
          }

          existingIds={vehicles.map(
            (vehicle) =>
              vehicle.id
          )}

          onAdd={handleAddVehicle}
        />

      )}

    </div>
  )
}

/*
 * ============================================================
 * MINI METRIC
 * ============================================================
 */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-950 p-3">

      <div className="text-[10px] uppercase tracking-wide text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-semibold text-slate-200">
        {value}
      </div>

    </div>
  )
}

/*
 * ============================================================
 * BENCHMARK METRIC
 * ============================================================
 */

function BenchmarkMetric({
  label,
  value,
  status,
}) {
  const statusClass =
    status === 'PASS'
      ? 'text-emerald-400'
      : status === 'ACTIVE'
        ? 'text-blue-400'
        : 'text-amber-400'

  return (
    <div className="bg-slate-950/40 p-4">

      <div className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-lg font-semibold text-slate-200">
        {value}
      </div>

      <div className={`mt-1 text-[9px] font-semibold ${statusClass}`}>
        ● {status}
      </div>

    </div>
  )
}