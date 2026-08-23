import React from 'react'

export default function StatusPill({
  status,
  mode,
}) {
  const lost =
    status === 'lost'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
        lost
          ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
          : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
      }`}
    >

      <span className="relative flex h-2 w-2">

        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
            lost
              ? 'bg-amber-400'
              : 'bg-emerald-400'
          }`}
        />

        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            lost
              ? 'bg-amber-400'
              : 'bg-emerald-400'
          }`}
        />

      </span>

      <div className="flex flex-col">

        <span className="text-[10px] font-semibold tracking-wide">
          {lost
            ? 'GNSS LOST'
            : 'GNSS CONNECTED'}
        </span>

        {mode && (
          <span className="text-[8px] opacity-60">
            {mode}
          </span>
        )}

      </div>

    </div>
  )
}