import React, { useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Circle,
} from 'react-leaflet'
import L from 'leaflet'
import { ROUTE } from '../utils/simulate.js'

const STATUS_CONFIG = {
  gnss: {
    color: '#22c55e',
    label: 'GNSS Active',
    bg: '#ecfdf5',
    text: '#047857',
  },

  'dead-reckoning': {
    color: '#f59e0b',
    label: 'Dead Reckoning',
    bg: '#fffbeb',
    text: '#b45309',
  },

  offline: {
    color: '#ef4444',
    label: 'Offline',
    bg: '#fef2f2',
    text: '#b91c1c',
  },
}

/*
|--------------------------------------------------------------------------
| Vehicle marker
|--------------------------------------------------------------------------
|
| Creates a directional vehicle marker.
| The arrow rotates according to vehicle heading.
|
*/

function markerIcon(status, selected, heading = 0) {
  const config =
    STATUS_CONFIG[status] || STATUS_CONFIG.offline

  const size = selected ? 38 : 30

  const html = `
    <div
      style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        transform: rotate(${heading}deg);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >

      ${
        selected
          ? `
            <div
              style="
                position:absolute;
                width:${size + 14}px;
                height:${size + 14}px;
                border-radius:50%;
                border:2px solid ${config.color};
                opacity:.25;
              "
            ></div>
          `
          : ''
      }

      <div
        style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${config.color};
          border:3px solid white;
          box-shadow:
            0 0 0 ${selected ? 4 : 2}px ${config.color}33,
            0 4px 10px rgba(0,0,0,.35);
          display:flex;
          align-items:center;
          justify-content:center;
        "
      >

        <div
          style="
            width:0;
            height:0;
            border-left:${size * 0.16}px solid transparent;
            border-right:${size * 0.16}px solid transparent;
            border-bottom:${size * 0.38}px solid white;
            transform:translateY(-2px);
          "
        ></div>

      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

/*
|--------------------------------------------------------------------------
| Confidence bar
|--------------------------------------------------------------------------
*/

function ConfidenceBar({ value, color = '#3b5bdb' }) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  )

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>Confidence</span>
        <span className="font-semibold text-gray-600">
          {safeValue.toFixed(0)}%
        </span>
      </div>

      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${safeValue}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Admin Map
|--------------------------------------------------------------------------
*/

export default function AdminMap({
  vehicles = [],
  selectedId,
  onSelect,
}) {
  const center = useMemo(
    () => ROUTE[0],
    []
  )

  const selectedVehicle = useMemo(
    () =>
      vehicles.find(
        (vehicle) =>
          vehicle.id === selectedId
      ),
    [vehicles, selectedId]
  )

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">

      <MapContainer
        center={center}
        zoom={14}
        zoomControl
        scrollWheelZoom
        className="h-full w-full"
      >

        {/* =========================================================
            Base Map
        ========================================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =========================================================
            Planned / Known Route
        ========================================================== */}

        <Polyline
          positions={ROUTE}
          pathOptions={{
            color: '#64748b',
            weight: 5,
            opacity: 0.45,
            dashArray: '8 8',
          }}
        />

        {/* =========================================================
            Vehicle Markers
        ========================================================== */}

        {vehicles.map((vehicle) => {
          const config =
            STATUS_CONFIG[vehicle.status] ||
            STATUS_CONFIG.offline

          const isSelected =
            vehicle.id === selectedId

          const heading =
            Number(vehicle.heading) || 0

          const aiConfidence =
            vehicle.aiConfidence ?? 0

          const mapMatchConfidence =
            vehicle.mapMatchConfidence ?? 0

          return (
            <React.Fragment key={vehicle.id}>

              {/* DR uncertainty radius */}

              {vehicle.status ===
                'dead-reckoning' &&
                vehicle.position && (
                  <Circle
                    center={vehicle.position}
                    radius={
                      vehicle.positionErrorM ||
                      35
                    }
                    pathOptions={{
                      color:
                        config.color,
                      fillColor:
                        config.color,
                      fillOpacity: 0.08,
                      weight: 1,
                      dashArray: '5 5',
                    }}
                  />
                )}

              <Marker
                position={vehicle.position}
                icon={markerIcon(
                  vehicle.status,
                  isSelected,
                  heading
                )}
                eventHandlers={{
                  click: () =>
                    onSelect?.(
                      vehicle.id
                    ),
                }}
              >

                <Popup
                  closeButton
                  className="navix-popup"
                >

                  <div className="min-w-[230px]">

                    {/* Header */}

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {vehicle.id}
                        </div>

                        <div className="mt-0.5 text-[10px] text-gray-400">
                          NAVIX Fleet Node
                        </div>
                      </div>

                      <span
                        className="rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                          background:
                            config.bg,
                          color:
                            config.text,
                        }}
                      >
                        {config.label}
                      </span>

                    </div>

                    {/* Divider */}

                    <div className="my-3 h-px bg-gray-100" />

                    {/* Telemetry */}

                    <div className="grid grid-cols-2 gap-2">

                      <div className="rounded-lg bg-gray-50 p-2">
                        <div className="text-[9px] uppercase tracking-wide text-gray-400">
                          Speed
                        </div>

                        <div className="mt-0.5 text-sm font-bold text-gray-800">
                          {vehicle.speedKmh !=
                          null
                            ? vehicle.speedKmh.toFixed(
                                0
                              )
                            : '0'}{' '}
                          <span className="text-[9px] font-normal text-gray-400">
                            km/h
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-2">
                        <div className="text-[9px] uppercase tracking-wide text-gray-400">
                          Accuracy
                        </div>

                        <div className="mt-0.5 text-sm font-bold text-gray-800">
                          {vehicle.accuracy !=
                          null
                            ? `${vehicle.accuracy.toFixed(
                                1
                              )}m`
                            : '—'}
                        </div>
                      </div>

                    </div>

                    {/* Navigation Mode */}

                    <div className="mt-2 rounded-lg border border-gray-100 p-2">

                      <div className="text-[9px] uppercase tracking-wide text-gray-400">
                        Navigation Mode
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-gray-700">

                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background:
                              config.color,
                          }}
                        />

                        {vehicle.mode ||
                          (vehicle.status ===
                          'gnss'
                            ? 'GNSS + INS'
                            : vehicle.status ===
                              'dead-reckoning'
                            ? 'AI Dead Reckoning'
                            : 'Offline')}
                      </div>

                    </div>

                    {/* AI confidence */}

                    {vehicle.aiConfidence !=
                      null && (
                      <div className="mt-3">

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">
                            AI Position Confidence
                          </span>

                          <span className="text-[10px] font-bold text-gray-700">
                            {aiConfidence.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                aiConfidence
                              )}%`,
                              background:
                                '#3b5bdb',
                            }}
                          />
                        </div>

                      </div>
                    )}

                    {/* Map matching */}

                    {vehicle.mapMatchConfidence !=
                      null && (
                      <div className="mt-2">

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">
                            Map Match
                          </span>

                          <span className="text-[10px] font-bold text-gray-700">
                            {mapMatchConfidence.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                100,
                                mapMatchConfidence
                              )}%`,
                            }}
                          />
                        </div>

                      </div>
                    )}

                    {/* DR diagnostics */}

                    {vehicle.status ===
                      'dead-reckoning' && (
                      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-2.5">

                        <div className="flex items-center gap-2">

                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] text-amber-700">
                            !
                          </span>

                          <div className="text-[10px] font-semibold text-amber-800">
                            GNSS Denied Environment
                          </div>

                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">

                          <div>
                            <div className="text-[9px] text-amber-600">
                              Drift
                            </div>

                            <div className="text-xs font-bold text-amber-800">
                              {vehicle.driftPercent !=
                              null
                                ? `${vehicle.driftPercent.toFixed(
                                    1
                                  )}%`
                                : '—'}
                            </div>
                          </div>

                          <div>
                            <div className="text-[9px] text-amber-600">
                              Position Error
                            </div>

                            <div className="text-xs font-bold text-amber-800">
                              {vehicle.positionErrorM !=
                              null
                                ? `${vehicle.positionErrorM.toFixed(
                                    1
                                  )} m`
                                : '—'}
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                    {/* Footer */}

                    <div className="mt-3 text-[9px] text-gray-400">
                      Live telemetry • AI sensor
                      fusion • map constrained
                    </div>

                  </div>

                </Popup>

              </Marker>

            </React.Fragment>
          )
        })}

      </MapContainer>

      {/* =========================================================
          Map Header
      ========================================================== */}

      <div className="pointer-events-none absolute left-3 top-3 z-[500]">

        <div className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            <span className="text-xs font-bold text-gray-800">
              LIVE FLEET
            </span>

          </div>

          <div className="mt-0.5 text-[9px] text-gray-400">
            GNSS + INS monitoring
          </div>

        </div>

      </div>

      {/* =========================================================
          Selected Vehicle Indicator
      ========================================================== */}

      {selectedVehicle && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">

          <div className="rounded-xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">

            <div className="flex items-center gap-2">

              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    STATUS_CONFIG[
                      selectedVehicle.status
                    ]?.color ||
                    '#94a3b8',
                }}
              />

              <div>

                <div className="text-[10px] font-bold text-gray-800">
                  {selectedVehicle.id}
                </div>

                <div className="text-[9px] text-gray-400">
                  {selectedVehicle.mode ||
                    'GNSS + INS'}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          Map Legend
      ========================================================== */}

      <div className="absolute bottom-3 right-3 z-[500]">

        <div className="rounded-xl border border-white/70 bg-white/95 p-3 shadow-lg backdrop-blur">

          <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Navigation Status
          </div>

          <div className="space-y-1.5">

            <LegendItem
              color="#22c55e"
              label="GNSS Active"
            />

            <LegendItem
              color="#f59e0b"
              label="Dead Reckoning"
            />

            <LegendItem
              color="#ef4444"
              label="Offline"
            />

          </div>

        </div>

      </div>

    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Legend Item
|--------------------------------------------------------------------------
*/

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">

      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: color,
        }}
      />

      <span className="text-[10px] text-gray-600">
        {label}
      </span>

    </div>
  )
}