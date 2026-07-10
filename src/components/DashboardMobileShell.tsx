import React from 'react'

type KPI = { title: string; value: string; delta?: string }

export const DashboardMobileShell: React.FC<{title?: string; kpis: KPI[]}> = ({ title = 'Dashboard', kpis }) => {
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="rounded-full bg-white/5 w-10 h-10" aria-label="avatar" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2">
        {kpis.map((k, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl p-4 shadow-inner">
            <div className="text-xs text-white/60 mb-1">{k.title}</div>
            <div className="text-lg font-semibold text-white">{k.value}</div>
            {k.delta && <div className="text-xs text-white/60">{k.delta}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
