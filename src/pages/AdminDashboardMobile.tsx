import React, { useEffect, useMemo, useState } from 'react'
import MobileScaleWrapper from '../components/MobileScaleWrapper'
import { ServiceDistributionChart } from '../components/ServiceDistributionChart'
import { useReservas } from '../hooks/useReservas'
import { useAuth } from '../context/useAuth'

type KPI = { title: string; value: string; delta?: string }

export default function AdminDashboardMobile() {
  const { user } = useAuth()
  const { getDashboardKPIs, getDashboardServiceCounts } = useReservas()
  const [period, setPeriod] = useState<'today'|'week'|'month'>('today')
  const [kpis, setKpis] = useState<KPI[]>([
    { title: 'Lavados realizados', value: '0' },
    { title: 'Reservas activas', value: '0' },
    { title: 'Ingresos', value: '$0' },
    { title: 'Clientes registrados', value: '0' },
  ])
  const [services, setServices] = useState<{service: string; count: number}[]>([])

  useEffect(() => {
    // load KPIs for default period excluding heavy operations on first render
    async function loadKPIs(){
      // compute range from period
      const now = new Date()
      let start = new Date(now)
      let end = new Date(now)
      if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(start)
      } else if (period === 'week') {
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)
        start = new Date(now.getFullYear(), now.getMonth(), diff)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
      const s = start.toISOString().slice(0,10)
      const e = end.toISOString().slice(0,10)
      const stats = await getDashboardKPIs(s,e) // expects {lavados,reservasActivas,ingresos,clientes}
      setKpis([
        { title: 'Lavados realizados', value: stats.lavados.toString() },
        { title: 'Reservas activas', value: stats.reservasActivas.toString() },
        { title: 'Ingresos', value: `$${stats.ingresos}` },
        { title: 'Clientes registrados', value: stats.clientes.toString() },
      ])
      const counts = await getDashboardServiceCounts(s,e)
      setServices(counts)
    }
    loadKPIs()
  }, [period])

  return (
    <MobileScaleWrapper>
      <div className="p-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/70">Bienvenido</div>
            <div className="text-xl font-bold text-white">Admin Dashboard</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-800" />
        </header>
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((k,i)=> (
              <div key={i} className="bg-white/5 rounded-xl p-4 text-white text-sm">
                <div className="text-xs text-white/60">{k.title}</div>
                <div className="text-lg font-semibold">{k.value}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-white/90">Distribución de servicios</div>
            <select
              className="bg-black/20 text-white text-sm rounded p-1"
              onChange={(e)=>{ const v=e.target.value; setPeriod(v as any); }}
              defaultValue={period}
            >
              <option value="today">Hoy</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>
          {services.length>0 ? (
            <ServiceDistributionChart data={services} height={180} />
          ) : (
            <div className="text-sm text-white/70">Cargando datos...</div>
          )}
        </section>
      </div>
    </MobileScaleWrapper>
  )
}
