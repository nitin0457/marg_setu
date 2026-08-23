import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  ROUTE,
  buildRouteTable,
  pointAtDistance,
  bearingToCompass,
  destinationPoint,
  noise,
  clamp,
  randomInRange,
} from '../utils/simulate.js'

const SimulationContext = createContext(null)

const ROUTE_TABLE = buildRouteTable(ROUTE)

const TICK_MS = 1000
const BASE_SPEED_KMH = 48
const MAX_CHART_POINTS = 24

const FLEET_SEED = [
  {
    id: 'CAR-002',
    center: [26.4695, 80.3395],
    radius: 260,
    status: 'gnss',
    speed: 38,
  },

  {
    id: 'CAR-003',
    center: [26.4555, 80.3245],
    radius: 200,
    status: 'gnss',
    speed: 44,
  },

  {
    id: 'CAR-004',
    center: [26.4630, 80.3510],
    radius: 0,
    status: 'offline',
    speed: 0,
  },

  {
    id: 'CAR-005',
    center: [26.4470, 80.3400],
    radius: 180,
    status: 'dead-reckoning',
    speed: 29,
  },
]

/* =========================================================
   INITIAL CAR
========================================================= */

function makeInitialCarOne() {
  const {
    position,
    heading,
  } = pointAtDistance(
    ROUTE,
    ROUTE_TABLE,
    0
  )

  return {
    id: 'CAR-001',

    distance: 0,

    position,

    truePosition: position,

    heading,

    speedKmh: 0,

    estimatedSpeedKmh: 0,

    gnssStatus: 'connected',

    mode: 'GNSS + INS',

    accuracy: 3.8,

    gnssAccuracy: 3.8,

    aiConfidence: 96.5,

    mapMatchConfidence: 98.2,

    driftErrorM: 0,

    signalStrength: 100,

    banner: null,

    tripStarted: false,

    outage: {
      active: false,

      startedAt: null,

      startDistance: 0,

      durationS: 0,

      distanceM: 0,

      driftPercent: 0,

      positionErrorM: 0,

      driftHeadingOffset: 0,
    },

    calibration: {
      pitch: 0,
      roll: 0,
      yaw: 0,

      calibrated: false,
    },

    sensorHealth: {
      accelerometer: 'healthy',
      gyroscope: 'healthy',
      magnetometer: 'healthy',
    },
  }
}

/* =========================================================
   INITIAL FLEET
========================================================= */

function makeInitialFleet() {
  return FLEET_SEED.map((vehicle) => ({
    ...vehicle,

    phase:
      Math.random() *
      Math.PI *
      2,

    position: vehicle.center,

    speedKmh: vehicle.speed,

    accuracy:
      vehicle.status === 'gnss'
        ? randomInRange(2.5, 5)
        : vehicle.status ===
          'dead-reckoning'
        ? randomInRange(15, 35)
        : null,

    aiConfidence:
      vehicle.status === 'offline'
        ? 0
        : randomInRange(88, 98),

    mapMatchConfidence:
      vehicle.status === 'offline'
        ? 0
        : randomInRange(90, 99),
  }))
}

/* =========================================================
   CREATE A NEW FLEET VEHICLE
   (used by the admin "Add Vehicle" flow)
========================================================= */

function createFleetVehicle(data) {
  const status = data.status || 'gnss'

  return {
    id: data.id,

    type: data.type || 'Car',
    vehicleType: data.vehicleType || data.type || 'Car',

    center: data.center,
    position: data.position || data.center,

    radius: data.radius ?? 150,
    phase:
      data.phase ??
      Math.random() * Math.PI * 2,

    status,
    speed: data.speed ?? 40,

    sensorProfile: data.sensorProfile,
    sensorProfileLabel: data.sensorProfileLabel,
    gnssQuality: data.gnssQuality,
    fusionConfidence: data.fusionConfidence,

    accuracy:
      data.accuracy ??
      (status === 'gnss'
        ? randomInRange(2.5, 5)
        : status === 'dead-reckoning'
        ? randomInRange(15, 35)
        : null),

    aiConfidence:
      data.aiConfidence ??
      (status === 'offline'
        ? 0
        : randomInRange(88, 98)),

    mapMatchConfidence:
      data.mapMatchConfidence ??
      (status === 'offline'
        ? 0
        : randomInRange(90, 99)),

    driftPercent: data.driftPercent ?? 0,
    positionError: data.positionErrorM ?? data.positionError ?? 0,
    outageDuration: data.outageDuration ?? 0,

    mapMatch: data.mapMatch,
    nhcStatus: data.nhcStatus,
    aiSpeedEstimate: data.aiSpeedEstimate,
    satellites: data.satellites,
    vibration: data.vibration,
    sensorHealth: data.sensorHealth,

    createdAt: data.createdAt || Date.now(),
  }
}

/* =========================================================
   PROVIDER
========================================================= */

export function SimulationProvider({
  children,
}) {
  /*
   * Every vehicle that a driver can actively pilot
   * (CAR-001 plus any vehicle switched into by the
   * driver dashboard) gets its own independent GNSS +
   * INS simulation state, keyed by vehicle id.
   */
  const [cars, setCars] =
    useState(() => ({
      'CAR-001': makeInitialCarOne(),
    }))

  const [activeVehicleId, setActiveVehicleId] =
    useState('CAR-001')

  const activeVehicleIdRef = useRef('CAR-001')

  useEffect(() => {
    activeVehicleIdRef.current = activeVehicleId
  }, [activeVehicleId])

  /*
   * Apply an updater function to whichever car the
   * driver currently has selected. Always reads the
   * latest activeVehicleId via the ref so it is safe
   * to call from timers / interval callbacks.
   */
  const updateActiveCar =
    useCallback((updater) => {
      setCars((prev) => {
        const id = activeVehicleIdRef.current

        const current =
          prev[id] || makeInitialCarOne()

        return {
          ...prev,
          [id]: updater(current),
        }
      })
    }, [])

  const [fleet, setFleet] =
    useState(makeInitialFleet)

  const [alerts, setAlerts] =
    useState([])
    
  const [imu, setImu] =
    useState({
      accel: {
        x: 0,
        y: 0,
        z: 9.81,
      },

      gyro: {
        x: 0,
        y: 0,
        z: 0,
      },

      magnetometer: {
        x: 0,
        y: 0,
        z: 0,
      },
    })

  const [chartData, setChartData] =
    useState([])

  const [calibration, setCalibration] =
    useState(null)

  /* Device compass */
  const [deviceHeading, setDeviceHeading] =
    useState(null)

  const [deviceOrientationActive, setDeviceOrientationActive] =
    useState(false)

  const tickCount = useRef(0)

  const bannerTimeouts =
    useRef([])

  /* =========================================================
     BANNER
  ========================================================= */
  

  const clearBannerTimeouts =
    useCallback(() => {
      bannerTimeouts.current.forEach(
        (timer) =>
          clearTimeout(timer)
      )

      bannerTimeouts.current = []
    }, [])

  const showBannerSequence =
    useCallback(
      (steps) => {
        clearBannerTimeouts()

        steps.forEach(
          ({
            text,
            delay,
          }) => {
            const timer =
              setTimeout(() => {
                updateActiveCar((prev) => ({
                  ...prev,
                  banner: text,
                }))
              }, delay)

            bannerTimeouts.current.push(
              timer
            )
          }
        )


        const last =
          steps[
            steps.length - 1
          ]

        if (!last) return

        const clearTimer =
          setTimeout(() => {
            updateActiveCar((prev) => ({
              ...prev,
              banner: null,
            }))
          }, last.delay + 2200)

        bannerTimeouts.current.push(
          clearTimer
        )
      },
      [clearBannerTimeouts, updateActiveCar]
    )

  useEffect(() => {
    return () => {
      clearBannerTimeouts()
    }
  }, [clearBannerTimeouts])

  /* =========================================================
     DEVICE ORIENTATION / COMPASS
  ========================================================= */

  const handleOrientation =
    useCallback((event) => {
      let heading = null

      /*
       * iOS Safari
       */
      if (
        typeof event.webkitCompassHeading ===
        'number'
      ) {
        heading =
          event.webkitCompassHeading
      }

      /*
       * Android / Chrome
       */
      else if (
        typeof event.alpha ===
        'number'
      ) {
        heading =
          360 - event.alpha
      }

      if (
        heading !== null &&
        Number.isFinite(heading)
      ) {
        heading =
          ((heading % 360) + 360) %
          360

        setDeviceHeading(heading)

        setDeviceOrientationActive(
          true
        )
      }
    }, [])

  const enableDeviceCompass =
    useCallback(async () => {
      try {
        /*
         * iOS requires permission.
         */
        if (
          typeof DeviceOrientationEvent !==
            'undefined' &&
          typeof DeviceOrientationEvent.requestPermission ===
            'function'
        ) {
          const permission =
            await DeviceOrientationEvent.requestPermission()

          if (
            permission !==
            'granted'
          ) {
            setDeviceOrientationActive(
              false
            )

            return false
          }
        }

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

        setDeviceOrientationActive(
          true
        )

        return true
      } catch (error) {
        console.error(
          'Compass permission error:',
          error
        )

        setDeviceOrientationActive(
          false
        )

        return false
      }
    }, [handleOrientation])

  useEffect(() => {
    return () => {
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
    }
  }, [handleOrientation])

  /* =========================================================
     MAIN SIMULATION
  ========================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        tickCount.current += 1

        /*
         * VEHICLE UPDATE
         */

        setCars((prevCars) => {
          const nextCars = {}

          for (const id of Object.keys(prevCars)) {
          const prev = prevCars[id]

          if (!prev.tripStarted) {
            nextCars[id] = prev
            continue
          }

          const speedNoise =
            randomInRange(-3, 3)

          const speedKmh = clamp(
            BASE_SPEED_KMH +
              speedNoise,
            18,
            62
          )

          const distanceStepM =
            (speedKmh * 1000) /
            3600

          const nextDistance =
            prev.distance +
            distanceStepM

          const {
            position: truePosition,
            heading,
          } =
            pointAtDistance(
              ROUTE,
              ROUTE_TABLE,
              nextDistance
            )

          let outage =
            prev.outage

          let displayPosition =
            truePosition

          let accuracy =
            prev.accuracy

          let aiConfidence =
            prev.aiConfidence

          let mapMatchConfidence =
            prev.mapMatchConfidence

          /*
           * GNSS LOST
           */

          if (
            prev.gnssStatus ===
            'lost'
          ) {
            const durationS =
              outage.durationS +
              TICK_MS / 1000

            const distanceM =
              outage.distanceM +
              distanceStepM

            /*
             * Simulated AI drift model
             */

            const driftPercent =
              clamp(
                2.5 +
                  durationS * 0.9 +
                  noise(0.6),
                0,
                45
              )

            const positionErrorM =
              clamp(
                (distanceM *
                  driftPercent) /
                  100,
                0,
                400
              )

            const driftHeadingOffset =
              outage.driftHeadingOffset +
              noise(4)

            /*
             * Dead reckoning position
             */

            displayPosition =
              destinationPoint(
                truePosition,
                heading +
                  90 +
                  driftHeadingOffset,
                positionErrorM
              )

            /*
             * AI confidence decreases
             */

            aiConfidence =
              clamp(
                97 -
                  durationS *
                    0.55 +
                  noise(1),
                55,
                97
              )

            /*
             * Map matching recovers
             * part of the drift
             */

            mapMatchConfidence =
              clamp(
                96 -
                  durationS *
                    0.25 +
                  noise(1),
                65,
                98
              )

            accuracy = clamp(
              4 +
                positionErrorM *
                  0.6,
              4,
              260
            )

            outage = {
              ...outage,

              active: true,

              durationS,

              distanceM,

              driftPercent,

              positionErrorM,

              driftHeadingOffset,
            }
          }

          /*
           * GNSS CONNECTED
           */

          else {
            accuracy = clamp(
              3.5 + noise(0.8),
              2.5,
              6
            )

            aiConfidence =
              clamp(
                96 +
                  noise(1),
                90,
                99
              )

            mapMatchConfidence =
              clamp(
                98 +
                  noise(0.5),
                94,
                99
              )
          }

          /*
           * AI estimated speed
           */

          const estimatedSpeedKmh =
            clamp(
              speedKmh +
                (prev.gnssStatus ===
                'lost'
                  ? noise(2.5)
                  : noise(0.7)),
              0,
              150
            )

          /*
           * GNSS signal strength
           */

          const signalStrength =
            prev.gnssStatus ===
            'lost'
              ? 0
              : clamp(
                  92 + noise(5),
                  70,
                  100
                )

          nextCars[id] = {
            ...prev,

            distance:
              nextDistance,

            truePosition,

            position:
              displayPosition,

            heading,

            speedKmh,

            estimatedSpeedKmh,

            accuracy,

            gnssAccuracy:
              accuracy,

            aiConfidence,

            mapMatchConfidence,

            driftErrorM:
              outage.positionErrorM ||
              0,

            signalStrength,

            outage,
          }
          }

          return nextCars
        })

        /*
         * IMU TELEMETRY
         */

        setCars((prevCars) => {
          const activeId = activeVehicleIdRef.current
          const prev = prevCars[activeId] || makeInitialCarOne()

          const movingFactor =
            prev.tripStarted
              ? prev.speedKmh / 50
              : 0.05

          const accelNoise =
            0.6 +
            movingFactor * 0.4

          const accel = {
            x: +noise(
              accelNoise
            ).toFixed(2),

            y: +noise(
              accelNoise
            ).toFixed(2),

            z: +(
              9.81 +
              noise(0.15)
            ).toFixed(2),
          }

          const gyro = {
            x: +noise(
              1.2 *
                (prev.gnssStatus ===
                'lost'
                  ? 1.6
                  : 1)
            ).toFixed(2),

            y: +noise(
              1.2 *
                (prev.gnssStatus ===
                'lost'
                  ? 1.6
                  : 1)
            ).toFixed(2),

            z: +noise(
              2.5
            ).toFixed(2),
          }

          const magnetometer = {
            x: +noise(20).toFixed(
              2
            ),

            y: +noise(20).toFixed(
              2
            ),

            z: +noise(35).toFixed(
              2
            ),
          }

          setImu({
            accel,
            gyro,
            magnetometer,
          })

          /*
           * Chart
           */

          const rawSpeed =
            clamp(
              prev.speedKmh +
                noise(6),
              0,
              70
            )

          const filteredSpeed =
            clamp(
              prev.speedKmh +
                noise(1.5),
              0,
              70
            )

          const estimatedSpeed =
            clamp(
              prev.estimatedSpeedKmh +
                noise(1),
              0,
              70
            )

          setChartData(
            (prevData) => {
              const next = [
                ...prevData,

                {
                  t:
                    tickCount.current,

                  raw:
                    +rawSpeed.toFixed(
                      1
                    ),

                  filtered:
                    +filteredSpeed.toFixed(
                      1
                    ),

                  estimated:
                    +estimatedSpeed.toFixed(
                      1
                    ),
                },
              ]

              return next.slice(
                -MAX_CHART_POINTS
              )
            }
          )

          return prevCars
        })

        /*
         * SECONDARY FLEET
         */

        setFleet((prev) =>
          prev.map((vehicle) => {
            if (
              vehicle.status ===
                'offline' ||
              vehicle.radius === 0
            ) {
              return vehicle
            }

            const nextPhase =
              vehicle.phase +
              0.12

            const lat =
              vehicle.center[0] +
              (vehicle.radius /
                111320) *
                Math.sin(
                  nextPhase
                )

            const lon =
              vehicle.center[1] +
              (vehicle.radius /
                (111320 *
                  Math.cos(
                    (vehicle.center[0] *
                      Math.PI) /
                      180
                  ))) *
                Math.cos(
                  nextPhase
                )

            return {
              ...vehicle,

              phase: nextPhase,

              position: [
                lat,
                lon,
              ],

              speedKmh:
                clamp(
                  vehicle.speed +
                    noise(3),
                  0,
                  120
                ),

              accuracy:
                vehicle.status ===
                'gnss'
                  ? randomInRange(
                      2.5,
                      6
                    )
                  : randomInRange(
                      10,
                      35
                    ),

              aiConfidence:
                clamp(
                  vehicle.aiConfidence +
                    noise(1),
                  60,
                  99
                ),

              mapMatchConfidence:
                clamp(
                  vehicle.mapMatchConfidence +
                    noise(0.7),
                  70,
                  99
                ),
            }
          })
        )
      }, TICK_MS)

    return () =>
      clearInterval(interval)
  }, [])
  // ============================================================
// ADD VEHICLE
// ============================================================
const addVehicle = useCallback(
  (vehicleData) => {
    const id =
      vehicleData.id?.trim() ||
      `CAR-${String(fleet.length + 2).padStart(3, '0')}`

    if (
      id === 'CAR-001' ||
      fleet.some((v) => v.id === id)
    ) {
      throw new Error(
        `A vehicle with id ${id} already exists.`
      )
    }

    const newVehicle = createFleetVehicle({
      ...vehicleData,

      id,

      type:
        vehicleData.type || 'Car',

      center:
        vehicleData.center ||
        vehicleData.position || [
          26.455 +
            randomInRange(-0.02, 0.02),

          80.335 +
            randomInRange(-0.02, 0.02),
        ],

      radius:
        Number(vehicleData.radius) || 150,

      status:
        vehicleData.status || 'gnss',

      speed:
        Number(vehicleData.speed) || 40,
    })

    setFleet((prev) => [
      ...prev,
      newVehicle,
    ])

    setAlerts((prev) => [
      {
        id: Date.now(),
        vehicleId: id,
        type: 'info',
        message: `${id} added to fleet`,
        time: new Date().toLocaleTimeString(),
      },

      ...prev,
    ].slice(0, 20))

    return newVehicle
  },
  [fleet]
)

  /* =========================================================
     REMOVE VEHICLE
  ========================================================= */

  const removeVehicle = useCallback(
    (id) => {
      if (id === 'CAR-001') return

      setFleet((prev) =>
        prev.filter((v) => v.id !== id)
      )

      setCars((prev) => {
        if (!prev[id]) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })

      setAlerts((prev) => [
        {
          id: Date.now(),
          vehicleId: id,
          type: 'warning',
          message: `${id} removed from fleet`,
          time: new Date().toLocaleTimeString(),
        },

        ...prev,
      ].slice(0, 20))
    },
    []
  )

  /* =========================================================
     UPDATE VEHICLE STATUS (admin fleet vehicles)
  ========================================================= */

  const updateVehicleStatus = useCallback(
    (id, status) => {
      setFleet((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status } : v
        )
      )
    },
    []
  )

  /* =========================================================
     ALERTS
  ========================================================= */

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  /* =========================================================
     SWITCH VEHICLE (driver dashboard)
  ========================================================= */

  const switchVehicle = useCallback((id) => {
    if (!id) return

    setCars((prev) => {
      if (prev[id]) return prev

      return {
        ...prev,
        [id]: {
          ...makeInitialCarOne(),
          id,
        },
      }
    })

    setActiveVehicleId(id)
  }, [])

  /*
   * Vehicles the driver is allowed to switch into:
   * CAR-001 plus every vehicle currently registered
   * in the admin fleet.
   */
  const driverVehicleIds = useMemo(() => {
    const ids = ['CAR-001', ...fleet.map((v) => v.id)]
    return Array.from(new Set(ids))
  }, [fleet])

  /* =========================================================
     FLEET TOTALS
  ========================================================= */

  const totals = useMemo(() => {
    const carOneStatus =
      cars['CAR-001']?.gnssStatus === 'lost'
        ? 'dead-reckoning'
        : 'gnss'

    const statuses = [
      carOneStatus,
      ...fleet.map((v) => v.status),
    ]

    return {
      total: statuses.length,
      online: statuses.filter(
        (s) => s !== 'offline'
      ).length,
      gnss: statuses.filter((s) => s === 'gnss')
        .length,
      deadReckoning: statuses.filter(
        (s) => s === 'dead-reckoning'
      ).length,
      offline: statuses.filter(
        (s) => s === 'offline'
      ).length,
    }
  }, [cars, fleet])

  /* =========================================================
     START TRIP
  ========================================================= */

  const startTrip =
    useCallback(() => {
      updateActiveCar((prev) => ({
        ...prev,

        tripStarted: true,

        banner:
          'TRIP STARTED',
      }))

      const timer =
        setTimeout(() => {
          updateActiveCar((prev) => ({
            ...prev,
            banner: null,
          }))
        }, 1800)

      bannerTimeouts.current.push(
        timer
      )
    }, [updateActiveCar])

  /* =========================================================
     GNSS OUTAGE
  ========================================================= */

  const simulateOutage =
    useCallback(() => {
      updateActiveCar((prev) => {
        if (
          prev.gnssStatus ===
          'lost'
        ) {
          return prev
        }

        return {
          ...prev,

          gnssStatus: 'lost',

          mode:
            'Dead Reckoning',

          signalStrength: 0,

          outage: {
            active: true,

            startedAt:
              Date.now(),

            startDistance:
              prev.distance,

            durationS: 0,

            distanceM: 0,

            driftPercent: 0,

            positionErrorM: 0,

            driftHeadingOffset:
              noise(6),
          },
        }
      })

      showBannerSequence([
        {
          text: 'GNSS LOST',
          delay: 50,
        },

        {
          text:
            'AI DEAD RECKONING ACTIVE',
          delay: 1600,
        },

        {
          text:
            'MAP MATCHING ENABLED',
          delay: 3000,
        },
      ])
    }, [showBannerSequence, updateActiveCar])

  /* =========================================================
     RESTORE GNSS
  ========================================================= */

  const restoreGnss =
    useCallback(() => {
      updateActiveCar((prev) => {
        if (
          prev.gnssStatus !==
          'lost'
        ) {
          return prev
        }

        return {
          ...prev,

          gnssStatus:
            'connected',

          mode:
            'GNSS + INS',

          position:
            prev.truePosition,

          accuracy: 3.8,

          gnssAccuracy: 3.8,

          signalStrength: 96,

          driftErrorM: 0,

          aiConfidence: 98,

          mapMatchConfidence: 99,

          outage: {
            ...prev.outage,

            active: false,
          },
        }
      })

      showBannerSequence([
        {
          text: 'GNSS RESTORED',
          delay: 50,
        },

        {
          text: 'GNSS + INS',
          delay: 1400,
        },

        {
          text: 'DRIFT CORRECTED',
          delay: 2800,
        },
      ])
    }, [showBannerSequence, updateActiveCar])

  /* =========================================================
     CALIBRATION
  ========================================================= */

  const runCalibration =
    useCallback(() => {
      return new Promise(
        (resolve) => {
          setTimeout(() => {
            const result = {
              pitch: +randomInRange(
                -2.5,
                2.5
              ).toFixed(1),

              roll: +randomInRange(
                -2.5,
                2.5
              ).toFixed(1),

              yaw: +randomInRange(
                -4,
                4
              ).toFixed(1),
            }

            setCalibration(
              result
            )

            updateActiveCar((prev) => ({
              ...prev,

              calibration: {
                ...result,

                calibrated:
                  true,
              },
            }))

            resolve(result)
          }, 1400)
        }
      )
    }, [updateActiveCar])

  /*
   * carOne always refers to CAR-001 specifically —
   * this keeps the Admin dashboard's "primary vehicle"
   * view stable no matter which car the driver has
   * switched into.
   */
  const carOne =
    cars['CAR-001'] || makeInitialCarOne()

  /*
   * activeCar is whichever vehicle the driver has
   * currently selected on the Driver dashboard.
   */
  const activeCar =
    cars[activeVehicleId] || carOne

  /* =========================================================
     HEADING
  ========================================================= */

  const simulationDirection =
    bearingToCompass(
      activeCar.heading
    )

  /*
   * Use real device compass
   * when available.
   *
   * Otherwise fallback to
   * simulated vehicle heading.
   */

  const heading =
    deviceHeading !== null
      ? deviceHeading
      : activeCar.heading

  const direction =
    deviceHeading !== null
      ? bearingToCompass(
          deviceHeading
        )
      : simulationDirection

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = {
    carOne,

    activeCar,

    activeVehicleId,

    driverVehicleIds,

    switchVehicle,

    fleet,

    alerts,

    totals,

    addVehicle,

    removeVehicle,

    updateVehicleStatus,

    clearAlerts,

    imu,

    chartData,

    calibration,

    heading,

    direction,

    deviceHeading,

    deviceOrientationActive,

    enableDeviceCompass,

    startTrip,

    simulateOutage,

    restoreGnss,

    runCalibration,

    ROUTE,
  }

  return (
    <SimulationContext.Provider
      value={value}
    >
      {children}
    </SimulationContext.Provider>
  )
}

/* =========================================================
   HOOK
========================================================= */

export function useSimulation() {
  const ctx =
    useContext(
      SimulationContext
    )

  if (!ctx) {
    throw new Error(
      'useSimulation must be used within a SimulationProvider'
    )
  }

  return ctx
}

export { ROUTE }