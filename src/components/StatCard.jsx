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
    <div className="card p-3 md:p-5 flex flex-col gap-2 md:gap-3">
      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
            style={{ background: accent || 'rgba(59,130,246,0.1)', color: accent ? 'white' : '#60a5fa' }}>
            <Icon size={13} />
          </div>
        )}
      </div>
      <div>
        <div className="font-bold text-white number-font" style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>{value}</div>
        {subValue && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subValue}</div>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {fmtPct(change)} 24h
        </div>
      )}
    </div>
  )
}
