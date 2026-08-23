// ============================================================
// NAVIX IDR - Device Compass Utility
// ============================================================

let listener = null
let running = false

let currentHeading = null
let currentPitch = 0
let currentRoll = 0

let callback = null

const normalizeHeading = (value) => {
  if (value == null || Number.isNaN(Number(value))) {
    return null
  }

  let heading = Number(value) % 360

  if (heading < 0) {
    heading += 360
  }

  return heading
}

const shortestAngleDifference = (from, to) => {
  return ((to - from + 540) % 360) - 180
}

const smoothHeading = (previous, next, factor = 0.18) => {
  if (previous == null) return next

  const difference = shortestAngleDifference(previous, next)

  return normalizeHeading(
    previous + difference * factor
  )
}

export function headingToCompass(heading) {
  if (heading == null || Number.isNaN(Number(heading))) {
    return '—'
  }

  const directions = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ]

  const index = Math.round(
    normalizeHeading(heading) / 45
  ) % 8

  return directions[index]
}

function handleOrientation(event) {
  let heading = null

  // iOS Safari
  if (
    typeof event.webkitCompassHeading === 'number' &&
    event.webkitCompassHeading >= 0
  ) {
    heading = event.webkitCompassHeading
  }

  // Android / Chrome / other browsers
  else if (
    typeof event.alpha === 'number'
  ) {
    heading = 360 - event.alpha
  }

  heading = normalizeHeading(heading)

  if (heading == null) return

  currentHeading = smoothHeading(
    currentHeading,
    heading
  )

  currentPitch =
    typeof event.beta === 'number'
      ? event.beta
      : 0

  currentRoll =
    typeof event.gamma === 'number'
      ? event.gamma
      : 0

  if (callback) {
    callback({
      heading: currentHeading,
      pitch: currentPitch,
      roll: currentRoll,
      available: true,
    })
  }
}

export function isCompassSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.DeviceOrientationEvent !==
      'undefined'
  )
}

export async function requestCompassPermission() {
  if (!isCompassSupported()) {
    return false
  }

  try {
    if (
      typeof window.DeviceOrientationEvent
        .requestPermission === 'function'
    ) {
      const permission =
        await window.DeviceOrientationEvent.requestPermission()

      return permission === 'granted'
    }

    return true
  } catch (error) {
    console.error(
      'Compass permission error:',
      error
    )

    return false
  }
}

export async function startCompass(onUpdate) {
  if (typeof window === 'undefined') {
    return false
  }

  if (!isCompassSupported()) {
    return false
  }

  const permission =
    await requestCompassPermission()

  if (!permission) {
    return false
  }

  callback = onUpdate

  if (running) {
    return true
  }

  listener = handleOrientation

  window.addEventListener(
    'deviceorientation',
    listener,
    true
  )

  running = true

  return true
}

export function stopCompass() {
  if (
    typeof window !== 'undefined' &&
    listener
  ) {
    window.removeEventListener(
      'deviceorientation',
      listener,
      true
    )
  }

  listener = null
  running = false
  callback = null
}

export function getCompassState() {
  return {
    heading: currentHeading,
    pitch: currentPitch,
    roll: currentRoll,
    available: currentHeading != null,
  }
}

export function resetCompass() {
  currentHeading = null
  currentPitch = 0
  currentRoll = 0
}