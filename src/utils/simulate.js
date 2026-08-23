// NAVIX IDR — frontend-only simulation helpers.
// Everything here is mock/demo data. No real GNSS or sensor hardware is used.

// A simple loop route around Kanpur, UP, used as the demo road path.
export const ROUTE = [
  [26.4499, 80.3319],
  [26.4522, 80.3378],
  [26.4560, 80.3427],
  [26.4602, 80.3465],
  [26.4649, 80.3489],
  [26.4698, 80.3481],
  [26.4732, 80.3438],
  [26.4741, 80.3376],
  [26.4715, 80.3319],
  [26.4671, 80.3283],
  [26.4618, 80.3271],
  [26.4563, 80.3283],
  [26.4517, 80.3299],
  [26.4499, 80.3319],
]

const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

// Haversine distance in meters
export function distanceMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Bearing in degrees from point a to point b
export function bearing([lat1, lon1], [lat2, lon2]) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1))
  const brng = toDeg(Math.atan2(y, x))
  return (brng + 360) % 360
}

export function bearingToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

// Move a point forward along a bearing by a distance in meters
export function destinationPoint([lat, lon], bearingDeg, distM) {
  const R = 6371000
  const brng = toRad(bearingDeg)
  const lat1 = toRad(lat)
  const lon1 = toRad(lon)
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distM / R) +
      Math.cos(lat1) * Math.sin(distM / R) * Math.cos(brng)
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distM / R) * Math.cos(lat1),
      Math.cos(distM / R) - Math.sin(lat1) * Math.sin(lat2)
    )
  return [toDeg(lat2), toDeg(lon2)]
}

// Precompute cumulative distances along the route for interpolation
export function buildRouteTable(route) {
  const segLengths = []
  let total = 0
  for (let i = 0; i < route.length - 1; i++) {
    const d = distanceMeters(route[i], route[i + 1])
    segLengths.push(d)
    total += d
  }
  return { segLengths, total }
}

// Given distance travelled along the route (meters, wraps around), return [lat, lon] and heading
export function pointAtDistance(route, table, distM) {
  const total = table.total
  let d = distM % total
  if (d < 0) d += total
  for (let i = 0; i < table.segLengths.length; i++) {
    const segLen = table.segLengths[i]
    if (d <= segLen || i === table.segLengths.length - 1) {
      const t = segLen === 0 ? 0 : d / segLen
      const a = route[i]
      const b = route[i + 1]
      const lat = a[0] + (b[0] - a[0]) * t
      const lon = a[1] + (b[1] - a[1]) * t
      const heading = bearing(a, b)
      return { position: [lat, lon], heading }
    }
    d -= segLen
  }
  return { position: route[0], heading: 0 }
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

export function randomInRange(min, max) {
  return min + Math.random() * (max - min)
}

// Simple gaussian-ish noise via averaged uniforms
export function noise(amount) {
  return ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * amount
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, '0')}`
}
