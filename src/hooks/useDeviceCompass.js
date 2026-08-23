import { useCallback, useEffect, useRef, useState } from 'react'

function normalizeHeading(value) {
  if (!Number.isFinite(value)) return 0

  let heading = value % 360

  if (heading < 0) {
    heading += 360
  }

  return heading
}

function smoothAngle(current, target, factor = 0.18) {
  let difference = target - current

  if (difference > 180) {
    difference -= 360
  }

  if (difference < -180) {
    difference += 360
  }

  return normalizeHeading(
    current + difference * factor
  )
}

export default function useDeviceCompass() {
  const [heading, setHeading] = useState(0)

  const [pitch, setPitch] = useState(0)

  const [roll, setRoll] = useState(0)

  const [active, setActive] = useState(false)

  const [available, setAvailable] = useState(false)

  const [source, setSource] = useState('fallback')

  const [permissionRequired, setPermissionRequired] =
    useState(false)

  const headingRef = useRef(0)

  const offsetRef = useRef(0)

  const mouseRef = useRef({
    x: 0,
    y: 0,
  })

  const enabledRef = useRef(false)

  const handleOrientation = useCallback((event) => {
    let nextHeading = null

    /*
     * iOS / Safari
     */
    if (
      typeof event.webkitCompassHeading === 'number' &&
      Number.isFinite(event.webkitCompassHeading)
    ) {
      nextHeading =
        event.webkitCompassHeading
    }

    /*
     * Android / Chrome / standard API
     */
    if (
      nextHeading === null &&
      typeof event.alpha === 'number'
    ) {
      nextHeading = 360 - event.alpha
    }

    if (nextHeading === null) {
      return
    }

    const correctedHeading = normalizeHeading(
      nextHeading + offsetRef.current
    )

    headingRef.current = smoothAngle(
      headingRef.current,
      correctedHeading,
      0.22
    )

    setHeading(headingRef.current)

    if (typeof event.beta === 'number') {
      setPitch(event.beta)
    }

    if (typeof event.gamma === 'number') {
      setRoll(event.gamma)
    }

    setActive(true)

    setSource('device sensor')
  }, [])

  const handleMouseMove = useCallback((event) => {
    if (!enabledRef.current) return

    /*
     * Laptop fallback/demo mode.
     *
     * Horizontal mouse movement changes heading.
     * Vertical mouse movement changes pitch.
     *
     * This allows the compass to be demonstrated
     * on laptops that don't expose DeviceOrientation.
     */

    const x = event.clientX

    const y = event.clientY

    const width = window.innerWidth || 1

    const height = window.innerHeight || 1

    const horizontal =
      (x / width) * 360

    const vertical =
      ((y / height) - 0.5) * 60

    mouseRef.current.x = horizontal

    mouseRef.current.y = vertical

    const correctedHeading =
      normalizeHeading(
        horizontal + offsetRef.current
      )

    headingRef.current = smoothAngle(
      headingRef.current,
      correctedHeading,
      0.08
    )

    setHeading(headingRef.current)

    setPitch(vertical)

    setRoll(
      ((x / width) - 0.5) * 45
    )

    /*
     * Only use mouse fallback if actual
     * device orientation isn't producing data.
     */
    if (source !== 'device sensor') {
      setActive(true)
      setSource('laptop demo')
    }
  }, [source])

  const handleKeyDown = useCallback((event) => {
    if (!enabledRef.current) return

    const step = event.shiftKey ? 10 : 3

    if (
      event.key === 'ArrowRight' ||
      event.key.toLowerCase() === 'd'
    ) {
      headingRef.current =
        normalizeHeading(
          headingRef.current + step
        )

      setHeading(headingRef.current)

      setActive(true)

      if (source !== 'device sensor') {
        setSource('laptop keyboard')
      }
    }

    if (
      event.key === 'ArrowLeft' ||
      event.key.toLowerCase() === 'a'
    ) {
      headingRef.current =
        normalizeHeading(
          headingRef.current - step
        )

      setHeading(headingRef.current)

      setActive(true)

      if (source !== 'device sensor') {
        setSource('laptop keyboard')
      }
    }

    if (
      event.key === 'ArrowUp' ||
      event.key.toLowerCase() === 'w'
    ) {
      setPitch((value) =>
        Math.max(-90, value - step)
      )
    }

    if (
      event.key === 'ArrowDown' ||
      event.key.toLowerCase() === 's'
    ) {
      setPitch((value) =>
        Math.min(90, value + step)
      )
    }
  }, [source])

  const enableCompass = useCallback(async () => {
    enabledRef.current = true

    /*
     * iOS requires explicit permission.
     */
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !==
        'undefined' &&
      typeof DeviceOrientationEvent.requestPermission ===
        'function'
    ) {
      try {
        const permission =
          await DeviceOrientationEvent.requestPermission()

        if (permission !== 'granted') {
          setPermissionRequired(true)

          setSource('permission denied')

          return false
        }
      } catch (error) {
        console.error(
          'Compass permission error:',
          error
        )

        setPermissionRequired(true)

        return false
      }
    }

    let sensorAvailable = false

    if (
      typeof window !== 'undefined' &&
      'DeviceOrientationEvent' in window
    ) {
      sensorAvailable = true

      window.addEventListener(
        'deviceorientationabsolute',
        handleOrientation,
        true
      )

      window.addEventListener(
        'deviceorientation',
        handleOrientation,
        true
      )
    }

    setAvailable(sensorAvailable)

    /*
     * Always enable laptop fallback.
     * It becomes secondary if real sensor data arrives.
     */
    window.addEventListener(
      'mousemove',
      handleMouseMove
    )

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    setActive(true)

    /*
     * Start from current heading.
     */
    headingRef.current =
      normalizeHeading(
        headingRef.current
      )

    setHeading(
      headingRef.current
    )

    return true
  }, [
    handleOrientation,
    handleMouseMove,
    handleKeyDown,
  ])

  const calibrateCompass = useCallback(() => {
    /*
     * Current heading becomes the zero/reference
     * orientation.
     */
    offsetRef.current =
      normalizeHeading(
        -headingRef.current
      )

    setHeading(0)

    return 0
  }, [])

  useEffect(() => {
    return () => {
      enabledRef.current = false

      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation,
        true
      )

      window.removeEventListener(
        'deviceorientation',
        handleOrientation,
        true
      )

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    handleOrientation,
    handleMouseMove,
    handleKeyDown,
  ])

  return {
    heading,
    pitch,
    roll,
    active,
    available,
    source,
    permissionRequired,
    enableCompass,
    calibrateCompass,
  }
}