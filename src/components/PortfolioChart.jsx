import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { fmt$ } from './StatCard'

const PERIODS = ['24H', '7D', '30D', '90D', '1Y', 'ALL']

function generateHistoricalData(totalValue, days) {
  const data = []
  let val = totalValue
  const now = Date.now()
  const step = (days * 86400000) / Math.min(days * 4, 200)
  const points = Math.min(days * 4, 200)

  const vals = [val]
  for (let i = 1; i < points; i++) {
    const drift = 0.0002
    const vol = 0.018
    const rand = (Math.random() - 0.48) * vol
    val = val * (1 - drift - rand)
    vals.unshift(Math.max(val, totalValue * 0.3))
  }
  return vals.map((v, i) => ({
    time: new Date(now - (points - 1 - i) * step).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      ...(days <= 1 ? { hour: '2-digit', minute: '2-digit' } : {})
    }),
    value: v,
  }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="card p-3 text-xs" style={{ minWidth: 150, backdropFilter: 'blur(16px)' }}>
      <div style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-white font-semibold mt-1 number-font text-sm">{fmt$(val)}</div>
    </div>
  )
}

export default function PortfolioChart({ totalValue }) {
  const [period, setPeriod] = useState('7D')

  const days = { '24H': 1, '7D': 7, '30D': 30, '90D': 90, '1Y': 365, 'ALL': 730 }[period]
  const data = useMemo(() => generateHistoricalData(totalValue, days), [totalValue, period])

  const startVal = data[0]?.value ?? totalValue
  const change = totalValue - startVal
  const changePct = startVal ? (change / startVal) * 100 : 0
  const isUp = change >= 0

  return (
    <div className="card p-3 md:p-5">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Portfolio Value
          </div>
          <div className="text-3xl font-bold text-white number-font text-glow">{fmt$(totalValue)}</div>
          <div className={`flex items-center gap-1.5 mt-1 text-sm font-medium ${isUp ? 'positive' : 'negative'}`}>
            <span className="px-2 py-0.5 rounded-lg text-xs" style={{
              background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            }}>
              {isUp ? '▲' : '▼'} {fmt$(Math.abs(change))} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>vs {period} ago</span>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid var(--border)' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-300 active:scale-95"
              style={{
                background: period === p ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: period === p ? '#60a5fa' : 'var(--text-muted)',
                boxShadow: period === p ? '0 0 8px rgba(59,130,246,0.15)' : 'none',
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="50%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0.08} />
                <stop offset="95%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.4)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              interval={Math.floor(data.length / 5)} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value"
              stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth={2.5}
              fill="url(#portfolioGradient)" dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: isUp ? '#10b981' : '#ef4444', fill: 'var(--bg-card)', filter: `drop-shadow(0 0 6px ${isUp ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'})` }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
