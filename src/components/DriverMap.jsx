import React, { useEffect, useMemo, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { ROUTE } from '../utils/simulate.js'

function vehicleIcon(status, heading) {
  const color =
    status === 'lost'
      ? '#f59e0b'
      : '#3b82f6'

  const html = `
    <div
      style="
        width:42px;
        height:42px;
        display:flex;
        align-items:center;
        justify-content:center;
        transform:rotate(${heading}deg);
        transform-origin:center;
      "
    >
      <div
        style="
          width:36px;
          height:36px;
          border-radius:50%;
          background:${color}20;
          border:1px solid ${color}66;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 0 0 5px ${color}18;
        "
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2.5L18.5 19L12 15.2L5.5 19L12 2.5Z"
            fill="${color}"
            stroke="white"
            stroke-width="1.2"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  })
}

function Recenter({ position }) {
  const map = useMap()
  const first = useRef(true)

  useEffect(() => {
    if (!position) return

    if (first.current) {
      map.setView(position, 16)
      first.current = false
      return
    }

    map.panTo(position, {
      animate: true,
      duration: 0.5,
    })
  }, [position, map])

  return null
}

function AccuracyCircle({ position, accuracy }) {
  if (!position || !accuracy) return null

  return (
    <CircleMarker
      center={position}
      radius={Math.min(Math.max(accuracy / 2, 6), 35)}
      pathOptions={{
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.35,
      }}
    />
  )
}

export default function DriverMap({
  position,
  truePosition,
  heading = 0,
  gnssStatus = 'connected',
  showDrift = true,
  accuracy = 4,
  mode = 'GNSS + INS',
}) {
  const center = useMemo(() => ROUTE[0], [])

  const numericHeading = Number.isFinite(Number(heading))
    ? Number(heading)
    : 0

  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

      <MapContainer
        center={center}
        zoom={16}
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        className="h-full w-full"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Planned / reference route */}
        <Polyline
          positions={ROUTE}
          pathOptions={{
            color: '#64748b',
            weight: 5,
            opacity: 0.55,
          }}
        />

        {/* True/map-matched position */}
        {showDrift && truePosition && (
          <>
            <CircleMarker
              center={truePosition}
              radius={5}
              pathOptions={{
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.9,
                weight: 1,
              }}
            />

            {/* Drift vector */}
            {position && (
              <Polyline
                positions={[truePosition, position]}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 2,
                  dashArray: '5 5',
                  opacity: 0.9,
                }}
              />
            )}
          </>
        )}

        {/* Accuracy estimation */}
        <AccuracyCircle
          position={position}
          accuracy={accuracy}
        />

        {/* Current vehicle */}
        {position && (
          <Marker
            position={position}
            icon={vehicleIcon(
              gnssStatus === 'lost' ? 'lost' : 'connected',
              numericHeading
            )}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="text-sm font-bold">
                  NAVIX Vehicle
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div>
                    Mode: <b>{mode}</b>
                  </div>

                  <div>
                    GNSS:{' '}
                    <b>
                      {gnssStatus === 'lost'
                        ? 'Lost'
                        : 'Connected'}
                    </b>
                  </div>

                  <div>
                    Heading:{' '}
                    <b>
                      {Math.round(numericHeading)}°
                    </b>
                  </div>

                  <div>
                    Accuracy:{' '}
                    <b>
                      {Number(accuracy || 0).toFixed(1)} m
                    </b>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <Recenter position={position} />

      </MapContainer>

      {/* Map status overlay */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500]">
        <div className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                gnssStatus === 'lost'
                  ? 'animate-pulse bg-amber-400'
                  : 'animate-pulse bg-emerald-400'
              }`}
            />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
              {gnssStatus === 'lost'
                ? 'Dead Reckoning'
                : 'GNSS + INS'}
            </span>
          </div>

          <div className="mt-1 text-[9px] text-slate-500">
            Position tracking active
          </div>
        </div>
      </div>

      {/* Heading indicator */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">
        <div className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 backdrop-blur">
          <div className="text-[9px] uppercase tracking-wider text-slate-500">
            Heading
          </div>

          <div className="mt-0.5 font-mono text-sm font-bold text-white">
            {Math.round(numericHeading)
              .toString()
              .padStart(3, '0')}
            °
          </div>
        </div>
      </div>

    </div>
  )
}