import React, { useMemo, useState } from 'react'

const DEFAULT_LOCATION = {
  latitude: '26.4499',
  longitude: '80.3319',
}

const VEHICLE_TYPES = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'bike', label: 'Bike', icon: '🏍️' },
  { value: 'truck', label: 'Truck', icon: '🚚' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'ambulance', label: 'Emergency', icon: '🚑' },
]

const SENSOR_PROFILES = [
  {
    value: 'smartphone',
    label: 'Smartphone IMU',
    description: 'Accelerometer + Gyroscope + Magnetometer',
  },
  {
    value: 'external',
    label: 'External IMU',
    description: 'High-frequency external IMU',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Smartphone + External IMU',
  },
]

const GNSS_QUALITY = [
  {
    value: 'excellent',
    label: 'Excellent',
    color: 'text-emerald-400',
  },
  {
    value: 'good',
    label: 'Good',
    color: 'text-green-400',
  },
  {
    value: 'weak',
    label: 'Weak',
    color: 'text-amber-400',
  },
  {
    value: 'lost',
    label: 'Lost',
    color: 'text-red-400',
  },
]

const LOCATION_PRESETS = [
  {
    label: 'Kanpur',
    latitude: '26.4499',
    longitude: '80.3319',
  },
  {
    label: 'Route Start',
    latitude: '26.4505',
    longitude: '80.3325',
  },
  {
    label: 'Route North',
    latitude: '26.4695',
    longitude: '80.3395',
  },
]

export default function AddVehicleModal({
  onClose,
  onAdd,
  existingIds = [],
}) {
  const [form, setForm] = useState({
    id: '',
    type: 'car',
    status: 'gnss',
    speed: 40,
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    sensorProfile: 'smartphone',
    gnssQuality: 'excellent',
    fusionConfidence: 96,
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedVehicleType = useMemo(
    () => VEHICLE_TYPES.find((item) => item.value === form.type),
    [form.type]
  )

  const selectedSensor = useMemo(
    () => SENSOR_PROFILES.find((item) => item.value === form.sensorProfile),
    [form.sensorProfile]
  )

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
  }

  const handlePreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      latitude: preset.latitude,
      longitude: preset.longitude,
    }))

    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const vehicleId = form.id.trim().toUpperCase()

    if (!vehicleId) {
      setError('Please enter a vehicle ID.')
      return
    }

    if (existingIds.some((id) => id.toUpperCase() === vehicleId)) {
      setError('A vehicle with this ID already exists.')
      return
    }

    const latitude = Number(form.latitude)
    const longitude = Number(form.longitude)
    const speed = Number(form.speed)
    const fusionConfidence = Number(form.fusionConfidence)

    if (
      Number.isNaN(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError('Please enter a valid latitude between -90 and 90.')
      return
    }

    if (
      Number.isNaN(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError('Please enter a valid longitude between -180 and 180.')
      return
    }

    if (Number.isNaN(speed) || speed < 0 || speed > 150) {
      setError('Speed must be between 0 and 150 km/h.')
      return
    }

    if (
      Number.isNaN(fusionConfidence) ||
      fusionConfidence < 0 ||
      fusionConfidence > 100
    ) {
      setError('Fusion confidence must be between 0 and 100%.')
      return
    }

    setSubmitting(true)

    const vehicle = {
      id: vehicleId,

      // Fleet information
      type: form.type,
      vehicleType: selectedVehicleType?.label || 'Car',

      // Navigation state
      status: form.status,
      speed,

      // Location
      center: [latitude, longitude],
      position: [latitude, longitude],

      // Simulation movement
      radius: 120,
      phase: Math.random() * Math.PI * 2,

      // Sensor configuration
      sensorProfile: form.sensorProfile,
      sensorProfileLabel: selectedSensor?.label || 'Smartphone IMU',

      // GNSS / fusion metrics
      gnssQuality: form.gnssQuality,
      fusionConfidence,

      // Simulated telemetry
      accuracy:
        form.status === 'gnss'
          ? form.gnssQuality === 'excellent'
            ? 3.8
            : form.gnssQuality === 'good'
            ? 6.5
            : 18
          : form.status === 'dead-reckoning'
          ? 35
          : null,

      driftPercent:
        form.status === 'dead-reckoning'
          ? 2.5
          : 0,

      positionErrorM:
        form.status === 'dead-reckoning'
          ? 4
          : 0,

      mapMatch:
        form.status === 'offline'
          ? 'Unavailable'
          : 'Matched',

      nhcStatus:
        form.status === 'offline'
          ? 'Disabled'
          : 'Active',

      aiSpeedEstimate:
        form.status === 'offline'
          ? 0
          : speed * 0.99,

      satellites:
        form.status === 'offline'
          ? 0
          : form.gnssQuality === 'excellent'
          ? 17
          : form.gnssQuality === 'good'
          ? 12
          : 6,

      createdAt: Date.now(),
    }

    try {
      await Promise.resolve(onAdd(vehicle))
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/75 px-3 py-6 backdrop-blur-sm sm:px-5">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-lg text-brand-400">
              +
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Register Vehicle
                </h2>

                <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-400">
                  Fleet
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Configure vehicle telemetry and navigation parameters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

          {/* Vehicle Identity */}
          <section>
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Vehicle Identity
              </h3>
              <p className="mt-1 text-[10px] text-slate-600">
                Basic fleet registration information.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Vehicle ID */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Vehicle ID
                </label>

                <input
                  type="text"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="CAR-006"
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                />

                <p className="mt-1 text-[10px] text-slate-600">
                  Example: CAR-006, BIKE-002, TRUCK-003
                </p>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Vehicle Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-500"
                >
                  {VEHICLE_TYPES.map((vehicle) => (
                    <option
                      key={vehicle.value}
                      value={vehicle.value}
                    >
                      {vehicle.icon} {vehicle.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section>
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Navigation Configuration
              </h3>
              <p className="mt-1 text-[10px] text-slate-600">
                Configure the initial GNSS and INS state.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Navigation Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-500"
                >
                  <option value="gnss">
                    GNSS Active
                  </option>

                  <option value="dead-reckoning">
                    Dead Reckoning
                  </option>

                  <option value="offline">
                    Offline
                  </option>
                </select>
              </div>

              {/* GNSS Quality */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  GNSS Signal Quality
                </label>

                <select
                  name="gnssQuality"
                  value={form.gnssQuality}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-500"
                >
                  {GNSS_QUALITY.map((quality) => (
                    <option
                      key={quality.value}
                      value={quality.value}
                    >
                      {quality.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Sensor Profile */}
          <section>
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Sensor Profile
              </h3>
              <p className="mt-1 text-[10px] text-slate-600">
                Select the sensor source used by the navigation engine.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SENSOR_PROFILES.map((sensor) => {
                const active =
                  form.sensorProfile === sensor.value

                return (
                  <button
                    key={sensor.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sensorProfile: sensor.value,
                      }))
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        active
                          ? 'text-brand-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {sensor.label}
                    </div>

                    <div className="mt-1 text-[10px] leading-relaxed text-slate-600">
                      {sensor.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Speed + Confidence */}
          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Speed */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Initial Speed
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="speed"
                    value={form.speed}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 pr-20 text-sm text-white outline-none transition focus:border-brand-500"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                    km/h
                  </span>
                </div>
              </div>

              {/* Fusion Confidence */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Fusion Confidence
                  </label>

                  <span className="text-xs font-semibold text-brand-400">
                    {form.fusionConfidence}%
                  </span>
                </div>

                <input
                  type="range"
                  name="fusionConfidence"
                  min="0"
                  max="100"
                  value={form.fusionConfidence}
                  onChange={handleChange}
                  className="mt-2 w-full accent-indigo-500"
                />

                <div className="mt-1 flex justify-between text-[9px] text-slate-700">
                  <span>Low confidence</span>
                  <span>High confidence</span>
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Starting Location
                </h3>

                <p className="mt-1 text-[10px] text-slate-600">
                  Initial vehicle position for simulation.
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] text-slate-500 transition hover:border-brand-500/30 hover:text-brand-400"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-brand-500"
                />

                <span className="mt-1 block text-[10px] text-slate-600">
                  Latitude
                </span>
              </div>

              <div>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-700"
                />

                <span className="mt-1 block text-[10px] text-slate-600">
                  Longitude
                </span>
              </div>
            </div>
          </section>

          {/* Vehicle Preview */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Vehicle Preview
                </div>

                <div className="mt-1 text-sm font-semibold text-white">
                  {selectedVehicleType?.icon || '🚗'}{' '}
                  {form.id.trim().toUpperCase() || 'NEW-VEHICLE'}
                </div>
              </div>

              <div
                className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase ${
                  form.status === 'gnss'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : form.status === 'dead-reckoning'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {form.status === 'gnss'
                  ? 'GNSS'
                  : form.status === 'dead-reckoning'
                  ? 'Dead Reckoning'
                  : 'Offline'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PreviewItem
                label="Speed"
                value={`${form.speed} km/h`}
              />

              <PreviewItem
                label="Fusion"
                value={`${form.fusionConfidence}%`}
              />

              <PreviewItem
                label="Sensor"
                value={
                  form.sensorProfile === 'smartphone'
                    ? 'Phone IMU'
                    : form.sensorProfile === 'external'
                    ? 'External'
                    : 'Hybrid'
                }
              />

              <PreviewItem
                label="Map Match"
                value={
                  form.status === 'offline'
                    ? 'N/A'
                    : 'Ready'
                }
              />
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* System info */}
          <div className="rounded-xl border border-brand-500/10 bg-brand-500/5 p-3">
            <div className="flex gap-2">
              <span className="text-brand-400">ⓘ</span>

              <p className="text-[11px] leading-relaxed text-slate-500">
                This vehicle will be registered with the NAVIX simulation
                engine. Its telemetry, GNSS state, sensor profile, fusion
                confidence and position will become available to the live
                fleet monitoring system.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Registering…' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PreviewItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
      <div className="text-[9px] uppercase tracking-wide text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-semibold text-slate-300">
        {value}
      </div>
    </div>
  )
}