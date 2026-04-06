import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { fmt$ } from './StatCard'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a78bfa',
]

const COIN_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', LINK: '#2a5ada',
  ADA: '#0d1e7e', AVAX: '#e84142', DOT: '#e6007a', UNI: '#ff007a',
}

function ActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props
  return (
    <g>
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#e2e8f0" style={{ fontSize: 15, fontWeight: 700 }}>
        {payload.symbol}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12 }}>
        {fmt$(value)}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#60a5fa" style={{ fontSize: 11, fontWeight: 600 }}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 14}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.5} />
    </g>
  )
}

export default function AllocationChart({ positions, prices, details }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const data = positions
    .map(pos => {
      const p = prices[pos.id]
      const d = details[pos.id]
      const price = p?.usd ?? d?.current_price ?? 0
      const value = price * pos.amount
      return { name: pos.name, symbol: pos.symbol, value }
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <PieChartIcon size={14} style={{ color: '#a78bfa' }} />
        </div>
        <h2 className="font-semibold text-white">Allocation</h2>
      </div>
      <div className="flex-1" style={{ minHeight: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={ActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={entry.symbol} fill={COIN_COLORS[entry.symbol] || COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgba(19,29,53,0.9)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(val) => [fmt$(val), 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {data.slice(0, 8).map((entry, i) => {
          const pct = total ? ((entry.value / total) * 100).toFixed(1) : '0'
          const color = COIN_COLORS[entry.symbol] || COLORS[i % COLORS.length]
          return (
            <div key={entry.symbol}
              className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition-all duration-200 hover:bg-white/5 cursor-default"
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}40` }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.symbol}</span>
              <span className="ml-auto number-font" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
