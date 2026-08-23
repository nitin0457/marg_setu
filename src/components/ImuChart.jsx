import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts'

export default function ImuChart({
  data = [],
  gnssStatus = 'connected',
  aiConfidence,
}) {
  const isLost = gnssStatus === 'lost'

  /*
   * ---------------------------------------------------------
   * TELEMETRY ANALYTICS
   * ---------------------------------------------------------
   */

  const analytics = useMemo(() => {
    if (!data.length) {
      return {
        noiseReduction: 0,
        signalQuality: 0,
        confidence: aiConfidence ?? 0,
        sampleRate: 0,
      }
    }

    const rawValues = data
      .map((item) => Number(item.raw))
      .filter(Number.isFinite)

    const filteredValues = data
      .map((item) => Number(item.filtered))
      .filter(Number.isFinite)

    if (!rawValues.length || !filteredValues.length) {
      return {
        noiseReduction: 0,
        signalQuality: 0,
        confidence: aiConfidence ?? 0,
        sampleRate: 0,
      }
    }

    const average = (values) =>
      values.reduce((sum, value) => sum + value, 0) /
      values.length

    const rawAverage = average(rawValues)
    const filteredAverage = average(filteredValues)

    const rawVariance =
      rawValues.reduce(
        (sum, value) =>
          sum + Math.pow(value - rawAverage, 2),
        0
      ) / rawValues.length

    const filteredVariance =
      filteredValues.reduce(
        (sum, value) =>
          sum + Math.pow(value - filteredAverage, 2),
        0
      ) / filteredValues.length

    const rawNoise = Math.sqrt(rawVariance)
    const filteredNoise = Math.sqrt(filteredVariance)

    const noiseReduction =
      rawNoise > 0
        ? Math.max(
            0,
            Math.min(
              100,
              ((rawNoise - filteredNoise) /
                rawNoise) *
                100
            )
          )
        : 0

    /*
     * Demo confidence score.
     *
     * In the final SIH implementation this should be replaced
     * by the confidence output of the trained AI/ML model.
     */
    const calculatedConfidence = isLost
      ? Math.max(
          60,
          Math.min(
            96,
            94 - filteredNoise * 4
          )
        )
      : Math.max(
          75,
          Math.min(
            99,
            97 - filteredNoise * 2
          )
        )

    const confidence =
      aiConfidence != null
        ? aiConfidence
        : calculatedConfidence

    const signalQuality = Math.max(
      0,
      Math.min(
        100,
        100 - filteredNoise * 8
      )
    )

    return {
      noiseReduction,
      signalQuality,
      confidence,
      sampleRate: 10,
    }
  }, [data, isLost, aiConfidence])

  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

        <Header isLost={isLost} />

        <div className="flex h-64 flex-col items-center justify-center px-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-lg text-slate-600">
            ≋
          </div>

          <p className="mt-4 text-sm font-medium text-slate-400">
            Waiting for IMU telemetry
          </p>

          <p className="mt-1 max-w-xs text-center text-[11px] leading-relaxed text-slate-600">
            Start a vehicle trip to begin collecting
            accelerometer and gyroscope data.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-500">
              SENSOR STREAM STANDBY
            </span>
          </div>

        </div>

        <TelemetryFooter
          analytics={analytics}
          isLost={isLost}
        />
      </div>
    )
  }

  /*
   * ---------------------------------------------------------
   * MAIN COMPONENT
   * ---------------------------------------------------------
   */

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

      {/* Header */}
      <Header
        isLost={isLost}
        analytics={analytics}
      />

      {/* Pipeline */}
      <Pipeline isLost={isLost} />

      {/* Chart */}
      <div className="px-2 pb-3 pt-3 sm:px-4 sm:pt-4">

        <div className="h-60 w-full sm:h-64">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 15,
                left: -15,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="t"
                tick={{
                  fontSize: 10,
                  fill: '#64748b',
                }}
                tickLine={false}
                axisLine={{
                  stroke: '#1e293b',
                }}
                tickFormatter={(value) =>
                  `${value}s`
                }
              />

              <YAxis
                tick={{
                  fontSize: 10,
                  fill: '#64748b',
                }}
                tickLine={false}
                axisLine={false}
                width={38}
              />

              {/* GNSS outage reference */}
              {isLost && (
                <ReferenceLine
                  y={0}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeOpacity={0.15}
                />
              )}

              <Tooltip
                cursor={{
                  stroke: '#334155',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border:
                    '1px solid #334155',
                  borderRadius: 10,
                  fontSize: 11,
                  color: '#e2e8f0',
                  boxShadow:
                    '0 10px 30px rgba(0,0,0,0.35)',
                }}
                labelStyle={{
                  color: '#64748b',
                  marginBottom: 5,
                }}
                labelFormatter={(label) =>
                  `Time: ${label}s`
                }
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)}`,
                  name,
                ]}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="circle"
                iconSize={6}
                wrapperStyle={{
                  fontSize: 10,
                  color: '#64748b',
                }}
              />

              {/* RAW SENSOR */}
              <Line
                type="monotone"
                dataKey="raw"
                name="Raw IMU"
                stroke="#64748b"
                strokeWidth={1.3}
                strokeOpacity={0.55}
                dot={false}
                activeDot={{
                  r: 3,
                  strokeWidth: 0,
                }}
                isAnimationActive={false}
              />

              {/* AI / FILTERED SENSOR */}
              <Line
                type="monotone"
                dataKey="filtered"
                name="AI Filtered"
                stroke="#6366f1"
                strokeWidth={2.2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: '#0f172a',
                }}
                isAnimationActive={false}
              />

              {/* ESTIMATED VELOCITY */}
              <Line
                type="monotone"
                dataKey="estimated"
                name="Estimated Velocity"
                stroke="#10b981"
                strokeWidth={2.2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: '#0f172a',
                }}
                isAnimationActive={false}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* Analytics */}
      <TelemetryFooter
        analytics={analytics}
        isLost={isLost}
      />

    </div>
  )
}


/*
 * ===========================================================
 * HEADER
 * ===========================================================
 */

function Header({ isLost, analytics }) {
  return (
    <div className="border-b border-slate-800 px-4 py-4 sm:px-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              ≋
            </span>

            <div>
              <h3 className="text-sm font-semibold text-white">
                IMU Telemetry & Sensor Fusion
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-600">
                Real-time inertial signal processing
              </p>
            </div>

          </div>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Mode */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
              isLost
                ? 'border-amber-500/20 bg-amber-500/5'
                : 'border-emerald-500/10 bg-emerald-500/5'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLost
                  ? 'animate-pulse bg-amber-400'
                  : 'animate-pulse bg-emerald-400'
              }`}
            />

            <span
              className={`text-[10px] font-medium ${
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

          {/* AI */}
          <div className="rounded-full border border-brand-500/20 bg-brand-500/5 px-2.5 py-1">
            <span className="text-[10px] font-medium text-brand-400">
              AI PROCESSING
            </span>
          </div>

        </div>

      </div>

      {/* Confidence */}
      {analytics && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">

          <MiniMetric
            label="Model Confidence"
            value={`${analytics.confidence.toFixed(1)}%`}
            tone="brand"
          />

          <MiniMetric
            label="Signal Quality"
            value={`${analytics.signalQuality.toFixed(0)}%`}
            tone={
              analytics.signalQuality > 70
                ? 'green'
                : 'amber'
            }
          />

          <MiniMetric
            label="Noise Reduction"
            value={`${analytics.noiseReduction.toFixed(0)}%`}
            tone="green"
          />

          <MiniMetric
            label="Update Rate"
            value={`${analytics.sampleRate} Hz`}
            tone="default"
          />

        </div>
      )}

    </div>
  )
}


/*
 * ===========================================================
 * PIPELINE
 * ===========================================================
 */

function Pipeline({ isLost }) {
  return (
    <div className="border-b border-slate-800 bg-slate-950/50 px-4 py-3 sm:px-5">

      <div className="flex flex-wrap items-center gap-2">

        <PipelineStep>
          RAW IMU
        </PipelineStep>

        <PipelineArrow />

        <PipelineStep active>
          SENSOR FILTER
        </PipelineStep>

        <PipelineArrow />

        <PipelineStep active>
          AI VELOCITY
        </PipelineStep>

        <PipelineArrow />

        <PipelineStep green>
          {isLost
            ? 'INS DEAD RECKONING'
            : 'GNSS + INS FUSION'}
        </PipelineStep>

        <PipelineArrow />

        <PipelineStep purple>
          MAP MATCH
        </PipelineStep>

      </div>

    </div>
  )
}


/*
 * ===========================================================
 * PIPELINE COMPONENTS
 * ===========================================================
 */

function PipelineStep({
  children,
  active,
  green,
  purple,
}) {
  let classes =
    'border-slate-700 bg-slate-950 text-slate-500'

  if (active) {
    classes =
      'border-brand-500/20 bg-brand-500/5 text-brand-400'
  }

  if (green) {
    classes =
      'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
  }

  if (purple) {
    classes =
      'border-violet-500/20 bg-violet-500/5 text-violet-400'
  }

  return (
    <span
      className={`rounded-md border px-2 py-1 text-[9px] font-medium ${classes}`}
    >
      {children}
    </span>
  )
}

function PipelineArrow() {
  return (
    <span className="text-[10px] text-slate-700">
      →
    </span>
  )
}


/*
 * ===========================================================
 * MINI METRIC
 * ===========================================================
 */

function MiniMetric({
  label,
  value,
  tone = 'default',
}) {
  const toneClasses = {
    default: 'text-slate-300',
    brand: 'text-brand-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">

      <div className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div
        className={`mt-1 text-sm font-semibold ${toneClasses[tone]}`}
      >
        {value}
      </div>

    </div>
  )
}


/*
 * ===========================================================
 * FOOTER
 * ===========================================================
 */

function TelemetryFooter({
  analytics,
  isLost,
}) {
  return (
    <div className="grid grid-cols-2 border-t border-slate-800 sm:grid-cols-4">

      <div className="border-b border-r border-slate-800 px-3 py-3 sm:border-b-0">

        <div className="text-[9px] uppercase tracking-wider text-slate-600">
          Samples
        </div>

        <div className="mt-1 text-sm font-semibold text-slate-300">
          —
        </div>

      </div>

      <div className="border-b border-slate-800 px-3 py-3 sm:border-b-0 sm:border-r">

        <div className="text-[9px] uppercase tracking-wider text-slate-600">
          Navigation
        </div>

        <div
          className={`mt-1 text-sm font-semibold ${
            isLost
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        >
          {isLost
            ? 'INS / DR'
            : 'GNSS Aided'}
        </div>

      </div>

      <div className="border-r border-slate-800 px-3 py-3">

        <div className="text-[9px] uppercase tracking-wider text-slate-600">
          Processing
        </div>

        <div className="mt-1 flex items-center gap-1.5">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />

          <span className="text-sm font-semibold text-brand-400">
            Active
          </span>

        </div>

      </div>

      <div className="px-3 py-3">

        <div className="text-[9px] uppercase tracking-wider text-slate-600">
          Fusion
        </div>

        <div className="mt-1 text-sm font-semibold text-violet-400">
          Map Constrained
        </div>

      </div>

    </div>
  )
}