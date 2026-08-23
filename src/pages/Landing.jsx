import React from 'react'

const FEATURES = [
  {
    title: 'GNSS + INS Fusion',
    description: 'Seamlessly combines satellite positioning with inertial sensing.',
    icon: '◎',
  },
  {
    title: 'AI Dead Reckoning',
    description: 'Estimates motion during GNSS-denied environments using IMU data.',
    icon: '✦',
  },
  {
    title: 'Map Matching',
    description: 'Constrains estimated trajectories to the underlying road network.',
    icon: '⌁',
  },
  {
    title: 'Edge Ready',
    description: 'Designed for lightweight on-device inference and real-time updates.',
    icon: '◈',
  },
]

const METRICS = [
  ['10 Hz', 'Fusion updates'],
  ['< 10%', 'Target drift'],
  ['IMU', 'No OBD required'],
  ['Edge AI', 'On-device inference'],
]

export default function Landing({ onSelect }) {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            NAVBAR
        ===================================================== */}

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 11.5L20 4l-7.5 17-2.3-6.7L3 11.5z"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                  fill="rgba(255,255,255,0.15)"
                />
              </svg>

            </div>

            <div>
              <div className="text-sm font-bold tracking-tight">
                Marg <span className="text-brand-400">Setu</span>
              </div>

              <div className="text-[10px] text-slate-500">
                Intelligent Dead Reckoning
              </div>
            </div>

          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-[10px] font-medium text-emerald-400">
              SYSTEM READY
            </span>

          </div>

        </header>

        {/* =====================================================
            HERO
        ===================================================== */}

        <main>

          <section className="mx-auto max-w-4xl pt-16 text-center sm:pt-20 lg:pt-24">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                SIH 2026 • Intelligent Navigation
              </span>

            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">

              Navigation that keeps moving

              <span className="block bg-gradient-to-r from-brand-300 via-brand-400 to-blue-400 bg-clip-text text-transparent">
                when GNSS disappears.
              </span>

            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">

              NAVIX IDR transforms a smartphone into an intelligent
              dead-reckoning system by combining IMU sensing, AI-based
              motion estimation, map matching, and GNSS-INS fusion.

            </p>

            {/* Technical tags */}

            <div className="mt-6 flex flex-wrap justify-center gap-2">

              {[
                'AI Motion Estimation',
                'GNSS + INS',
                'Map Matching',
                'IMU Fusion',
                'Edge Inference',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-[10px] font-medium text-slate-400"
                >
                  {item}
                </span>
              ))}

            </div>

          </section>

          {/* =====================================================
              ACCESS CARDS
          ===================================================== */}

          <section className="mx-auto mt-12 max-w-3xl">

            <div className="mb-4 text-center">

              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Select demonstration mode
              </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Driver */}

              <button
                onClick={() => onSelect('driver')}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-brand-500/10 active:scale-[0.99]"
              >

                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-500/10 blur-3xl transition group-hover:bg-brand-500/20" />

                <div className="relative">

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white">

                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <circle cx="12" cy="7" r="3" />
                        <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
                      </svg>

                    </div>

                    <span className="text-lg text-slate-700 transition group-hover:translate-x-1 group-hover:text-brand-400">
                      →
                    </span>

                  </div>

                  <h2 className="mt-5 text-base font-semibold">
                    Driver Dashboard
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Experience continuous navigation with live IMU
                    telemetry, GNSS outage simulation and dead reckoning.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      IMU
                    </span>

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      GNSS
                    </span>

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      INS
                    </span>

                  </div>

                </div>

              </button>

              {/* Admin */}

              <button
                onClick={() => onSelect('admin')}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.99]"
              >

                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />

                <div className="relative">

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">

                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M12 2l7 4v5c0 5-3 9-7 11-4-2-7-6-7-11V6l7-4z" />
                        <path d="M9.5 12l1.7 1.7 3.8-4" />
                      </svg>

                    </div>

                    <span className="text-lg text-slate-700 transition group-hover:translate-x-1 group-hover:text-blue-400">
                      →
                    </span>

                  </div>

                  <h2 className="mt-5 text-base font-semibold">
                    Fleet Intelligence
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Monitor vehicles, GNSS outages, AI confidence,
                    map matching and sensor health in real time.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      FLEET
                    </span>

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      AI
                    </span>

                    <span className="rounded-md bg-slate-950 px-2 py-1 text-[9px] text-slate-500">
                      ANALYTICS
                    </span>

                  </div>

                </div>

              </button>

            </div>

          </section>

          {/* =====================================================
              SYSTEM METRICS
          ===================================================== */}

          <section className="mx-auto mt-10 max-w-3xl">

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 sm:grid-cols-4">

              {METRICS.map(([value, label], index) => (
                <div
                  key={label}
                  className={`px-4 py-4 text-center ${
                    index !== 0
                      ? 'border-l border-slate-800'
                      : ''
                  } ${
                    index === 2
                      ? 'border-l-0 sm:border-l'
                      : ''
                  }`}
                >

                  <div className="text-base font-semibold text-white sm:text-lg">
                    {value}
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">
                    {label}
                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* =====================================================
              CAPABILITIES
          ===================================================== */}

          <section className="mx-auto mt-12 max-w-4xl">

            <div className="mb-5 text-center">

              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Core technology
              </div>

              <h2 className="mt-2 text-lg font-semibold text-slate-200">
                Intelligent positioning pipeline
              </h2>

            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-sm text-brand-400">
                    {feature.icon}
                  </div>

                  <h3 className="mt-3 text-xs font-semibold text-slate-300">
                    {feature.title}
                  </h3>

                  <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                    {feature.description}
                  </p>

                </div>
              ))}

            </div>

          </section>

          {/* =====================================================
              PIPELINE
          ===================================================== */}

          <section className="mx-auto mt-12 max-w-3xl">

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">

              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">
                Navigation pipeline
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">

                {[
                  'GNSS',
                  'IMU',
                  'AI FILTER',
                  'DEAD RECKONING',
                  'MAP MATCH',
                  'FUSED POSITION',
                ].map((item, index, arr) => (
                  <React.Fragment key={item}>

                    <div
                      className={`rounded-lg border px-3 py-2 text-[9px] font-medium ${
                        item === 'FUSED POSITION'
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-500'
                      }`}
                    >
                      {item}
                    </div>

                    {index < arr.length - 1 && (
                      <span className="text-[10px] text-slate-700">
                        →
                      </span>
                    )}

                  </React.Fragment>
                ))}

              </div>

            </div>

          </section>

        </main>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="pb-6 pt-12 text-center">

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
              Simulation Environment
            </span>

            <span className="text-slate-800">
              •
            </span>

            <span className="text-[9px] text-slate-600">
              Smartphone-first GNSS-denied navigation
            </span>

          </div>

          <p className="mt-4 text-[9px] text-slate-700">
            NAVIX IDR • AI-assisted inertial navigation prototype
          </p>

        </footer>

      </div>
    </div>
  )
}