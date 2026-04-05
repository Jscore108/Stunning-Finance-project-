import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts'
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
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#e2e8f0" className="text-sm font-semibold" style={{ fontSize: 14, fontWeight: 600 }}>
        {payload.symbol}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12 }}>
        {fmt$(value)}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 11 }}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 12}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
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

  return (
    <div className="card p-5 flex flex-col h-full">
      <h2 className="font-semibold text-white mb-4">Allocation</h2>
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
            >
              {data.map((entry, i) => (
                <Cell key={entry.symbol} fill={COIN_COLORS[entry.symbol] || COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(val) => [fmt$(val), 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1 mt-3">
        {data.slice(0, 8).map((entry, i) => (
          <div key={entry.symbol} className="flex items-center gap-2 text-xs py-0.5">
            <div className="w-2 h-2 rounded-full shrink-0"
              style={{ background: COIN_COLORS[entry.symbol] || COLORS[i % COLORS.length] }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
