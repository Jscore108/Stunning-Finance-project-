import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function fmt$(n, decimals = 2) {
  if (n === undefined || n === null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals
  }).format(n)
}

export function fmtPct(n) {
  if (n === undefined || n === null || isNaN(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function fmtNum(n, decimals = 4) {
  if (n === undefined || n === null || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
  }).format(n)
}

export default function StatCard({ label, value, subValue, change, icon: Icon, accent }) {
  const isPositive = change >= 0
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: accent || 'rgba(59,130,246,0.1)', color: accent ? 'white' : '#60a5fa' }}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white number-font">{value}</div>
        {subValue && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subValue}</div>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {fmtPct(change)} 24h
        </div>
      )}
    </div>
  )
}
