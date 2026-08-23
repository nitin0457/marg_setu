import React from 'react'

const TONES = {
  default: {
    text: 'text-slate-200',
    accent: 'bg-slate-500',
    glow: 'bg-slate-500/10',
  },

  green: {
    text: 'text-emerald-400',
    accent: 'bg-emerald-400',
    glow: 'bg-emerald-500/10',
  },

  amber: {
    text: 'text-amber-400',
    accent: 'bg-amber-400',
    glow: 'bg-amber-500/10',
  },

  red: {
    text: 'text-red-400',
    accent: 'bg-red-400',
    glow: 'bg-red-500/10',
  },

  brand: {
    text: 'text-brand-400',
    accent: 'bg-brand-400',
    glow: 'bg-brand-500/10',
  },
}

export default function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}) {
  const colors =
    TONES[tone] ||
    TONES.default

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700">

      {/* Glow */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl ${colors.glow}`}
      />

      {/* Accent */}
      <div
        className={`absolute left-0 top-0 h-0.5 w-10 ${colors.accent}`}
      />

      <div className="relative flex items-center justify-between">

        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
          {label}
        </span>

        <span
          className={`h-1.5 w-1.5 rounded-full ${colors.accent}`}
        />

      </div>

      <div
        className={`relative mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl ${colors.text}`}
      >
        {value}
      </div>

      {sub && (
        <div className="relative mt-1 truncate text-[10px] text-slate-600">
          {sub}
        </div>
      )}

    </div>
  )
}