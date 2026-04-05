import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useSparkline } from '../hooks/usePrices'
import { fmt$, fmtPct } from './StatCard'

const COIN_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', LINK: '#2a5ada',
  ADA: '#0d1e7e', AVAX: '#e84142', DOT: '#e6007a', UNI: '#ff007a',
}

const PERIODS = [
  { label: '24H', days: 1 },
  { label: '7D',  days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

function CoinButton({ symbol, name, id, selected, onSelect, change24h }) {
  const color = COIN_COLORS[symbol] || '#3b82f6'
  return (
    <button onClick={() => onSelect(id)}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all"
      style={{
        background: selected ? `${color}18` : 'var(--bg-card)',
        borderColor: selected ? color : 'var(--border)',
        color: selected ? color : 'var(--text-secondary)',
      }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
        style={{ background: color, fontSize: 8 }}>
        {symbol.slice(0, 2)}
      </div>
      <span className="font-medium">{symbol}</span>
      {change24h !== undefined && (
        <span className={`text-xs ${change24h >= 0 ? 'positive' : 'negative'}`}>
          {fmtPct(change24h)}
        </span>
      )}
    </button>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs">
      <div style={{ color: 'var(--text-muted)' }}>{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div className="text-white font-semibold mt-1 number-font">{fmt$(payload[0].value)}</div>
    </div>
  )
}

function ChartInner({ coinId, symbol, days }) {
  const { data, loading } = useSparkline(coinId, days)
  const color = COIN_COLORS[symbol] || '#3b82f6'

  if (loading) return (
    <div className="flex items-center justify-center h-56" style={{ color: 'var(--text-muted)' }}>
      <div className="animate-pulse-slow">Loading chart…</div>
    </div>
  )
  if (!data.length) return (
    <div className="flex items-center justify-center h-56 text-sm" style={{ color: 'var(--text-muted)' }}>
      No data available
    </div>
  )

  const startPrice = data[0]?.price
  const endPrice = data[data.length - 1]?.price
  const isUp = endPrice >= startPrice

  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false} />
          <XAxis dataKey="ts"
            tickFormatter={ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
            interval={Math.floor(data.length / 5)} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v.toFixed(2)}`} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2}
            fill={`url(#grad-${symbol})`} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function PriceChart({ positions, prices, details }) {
  const [selectedCoin, setSelectedCoin] = useState(positions[0]?.id || 'bitcoin')
  const [period, setPeriod] = useState(PERIODS[1])

  const pos = positions.find(p => p.id === selectedCoin) || positions[0]
  const p = prices[selectedCoin]
  const d = details[selectedCoin]
  const currentPrice = p?.usd ?? d?.current_price
  const change24h = p?.usd_24h_change ?? d?.price_change_percentage_24h

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-white">Price Chart</h2>
          {pos && currentPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-white number-font">{fmt$(currentPrice)}</span>
              {change24h !== undefined && (
                <span className={`text-sm font-medium ${change24h >= 0 ? 'positive' : 'negative'}`}>
                  {fmtPct(change24h)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {PERIODS.map(per => (
            <button key={per.label} onClick={() => setPeriod(per)}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
              style={{
                background: period.label === per.label ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: period.label === per.label ? '#60a5fa' : 'var(--text-muted)',
                border: period.label === per.label ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}>
              {per.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coin selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {positions.map(p => (
          <CoinButton
            key={p.id}
            symbol={p.symbol}
            name={p.name}
            id={p.id}
            selected={selectedCoin === p.id}
            onSelect={setSelectedCoin}
            change24h={prices[p.id]?.usd_24h_change ?? details[p.id]?.price_change_percentage_24h}
          />
        ))}
      </div>

      {pos && <ChartInner coinId={selectedCoin} symbol={pos.symbol} days={period.days} />}
    </div>
  )
}
