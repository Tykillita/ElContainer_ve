import React, { useEffect, useState } from 'react'

type ServicePoint = { service: string; count: number }

export const ServiceDistributionChart: React.FC<{ data: ServicePoint[]; height?: number; onServiceClick?: (service: string) => void }>
  = ({ data, height = 260, onServiceClick }) => {
  const max = Math.max(1, ...data.map(d => d.count))
  return (
    <svg width="100%" height={height} role="img" aria-label="Distribución de servicios" viewBox={`0 0 ${data.length * 110} ${height}`}>
      {data.map((d, i) => {
        const h = Math.max(6, Math.round((d.count / max) * (height - 40)))
        const x = i * 100 + 10
        const y = height - h - 10
        return (
          <g key={d.service} transform={`translate(${x},0)`}>
            <rect x={0} y={y} width={60} height={h} rx={6} fill="#F59E0B" opacity={0.92} onClick={() => onServiceClick && onServiceClick(d.service)} />
            <text x={30} y={height - 2} textAnchor="middle" fontSize={11} fill="#fff">{d.service}</text>
          </g>
        )
      })}
    </svg>
  )
}
