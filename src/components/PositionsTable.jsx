import React, { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import { fmt$, fmtPct, fmtNum } from './StatCard'

const COIN_COLORS = {
  BTC:  '#f7931a', ETH:  '#627eea', SOL:  '#9945ff',
  LINK: '#2a5ada', ADA:  '#0d1e7e', AVAX: '#e84142',
  DOT:  '#e6007a', UNI:  '#ff007a', DOGE: '#c2a633',
  XRP:  '#346aa9', SUI:  '#4da2ff', APT:  '#00c2a0',
  ARB:  '#12aaff', OP:   '#ff0420', NEAR: '#00c08b',
}

function Sparkline({ data }) {
  if (!data || data.length < 2) return <div className="w-20 h-8" />
  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 80, h = 32, pad = 2
  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (p - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const isUp = prices[prices.length - 1] >= prices[0]
  const color = isUp ? '#10b981' : '#ef4444'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CoinIcon({ symbol, size = 28 }) {
  const color = COIN_COLORS[symbol] || '#64748b'
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.32 }}>
      {symbol.slice(0, 2)}
    </div>
  )
}

const COLS = ['Asset', 'Price', '24h %', '7d %', 'Holdings', 'Value', 'Avg Cost', 'P&L', 'Allocation', '7d Chart', '']

export default function PositionsTable({ positions, prices, details, totalValue, onRemove }) {
  const [sortCol, setSortCol] = useState('Value')
  const [sortDir, setSortDir] = useState('desc')
  const [addOpen, setAddOpen] = useState(false)

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const enriched = positions.map(pos => {
    const p = prices[pos.id]
    const d = details[pos.id]
    const currentPrice = p?.usd ?? d?.current_price ?? null
    const value = currentPrice ? currentPrice * pos.amount : null
    const costBasis = pos.avgBuyPrice * pos.amount
    const pnl = value !== null ? value - costBasis : null
    const pnlPct = pnl !== null ? (pnl / costBasis) * 100 : null
    const change24h = p?.usd_24h_change ?? d?.price_change_percentage_24h ?? null
    const change7d = d?.price_change_percentage_7d_in_currency ?? null
    const alloc = totalValue && value ? (value / totalValue) * 100 : null
    const sparkline = d?.sparkline_in_7d?.price
      ? d.sparkline_in_7d.price.map((price, i) => ({ ts: i, price }))
      : null
    return { ...pos, currentPrice, value, costBasis, pnl, pnlPct, change24h, change7d, alloc, sparkline }
  })

  const sorted = [...enriched].sort((a, b) => {
    const colMap = {
      'Asset': (x) => x.name,
      'Price': (x) => x.currentPrice ?? -Infinity,
      '24h %': (x) => x.change24h ?? -Infinity,
      '7d %': (x) => x.change7d ?? -Infinity,
      'Value': (x) => x.value ?? -Infinity,
      'P&L': (x) => x.pnl ?? -Infinity,
      'Allocation': (x) => x.alloc ?? -Infinity,
    }
    const fn = colMap[sortCol] || colMap['Value']
    const av = fn(a), bv = fn(b)
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  function SortIcon({ col }) {
    if (sortCol !== col) return <ArrowUpDown size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="font-semibold text-white">My Positions</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{positions.length} assets tracked</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <Plus size={13} /> Add Position
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLS.map(col => (
                <th
                  key={col}
                  onClick={() => ['Asset','Price','24h %','7d %','Value','P&L','Allocation'].includes(col) ? handleSort(col) : null}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider select-none whitespace-nowrap"
                  style={{
                    color: sortCol === col ? '#60a5fa' : 'var(--text-muted)',
                    cursor: ['Asset','Price','24h %','7d %','Value','P&L','Allocation'].includes(col) ? 'pointer' : 'default'
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {['Asset','Price','24h %','7d %','Value','P&L','Allocation'].includes(col) && <SortIcon col={col} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((pos, i) => (
              <tr key={pos.id}
                className="card-hover transition-colors"
                style={{ borderBottom: i < sorted.length - 1 ? '1px solid rgba(30,45,74,0.5)' : 'none' }}>
                {/* Asset */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={pos.symbol} />
                    <div>
                      <div className="font-medium text-white">{pos.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{pos.symbol}</div>
                    </div>
                  </div>
                </td>
                {/* Price */}
                <td className="px-4 py-3 number-font font-medium text-white whitespace-nowrap">
                  {pos.currentPrice ? fmt$(pos.currentPrice, pos.currentPrice > 100 ? 2 : 4) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                {/* 24h */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {pos.change24h !== null ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pos.change24h >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {fmtPct(pos.change24h)}
                    </span>
                  ) : '—'}
                </td>
                {/* 7d */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {pos.change7d !== null ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pos.change7d >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {fmtPct(pos.change7d)}
                    </span>
                  ) : '—'}
                </td>
                {/* Holdings */}
                <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {fmtNum(pos.amount, pos.amount < 1 ? 4 : 2)} {pos.symbol}
                </td>
                {/* Value */}
                <td className="px-4 py-3 number-font font-semibold text-white whitespace-nowrap">
                  {pos.value ? fmt$(pos.value) : '—'}
                </td>
                {/* Avg Cost */}
                <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {fmt$(pos.avgBuyPrice, pos.avgBuyPrice > 100 ? 2 : 4)}
                </td>
                {/* P&L */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {pos.pnl !== null ? (
                    <div>
                      <div className={`text-sm font-semibold number-font ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{fmt$(pos.pnl)}
                      </div>
                      <div className={`text-xs number-font ${pos.pnlPct >= 0 ? 'positive' : 'negative'}`}>
                        {fmtPct(pos.pnlPct)}
                      </div>
                    </div>
                  ) : '—'}
                </td>
                {/* Allocation */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {pos.alloc !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pos.alloc, 100)}%`, background: COIN_COLORS[pos.symbol] || '#3b82f6' }} />
                      </div>
                      <span className="text-xs number-font" style={{ color: 'var(--text-secondary)' }}>{pos.alloc.toFixed(1)}%</span>
                    </div>
                  ) : '—'}
                </td>
                {/* Sparkline */}
                <td className="px-4 py-3">
                  <Sparkline data={pos.sparkline} />
                </td>
                {/* Remove */}
                <td className="px-4 py-3">
                  <button onClick={() => onRemove(pos.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && <AddPositionModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}

function AddPositionModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="card p-6 w-full max-w-md mx-4">
        <h3 className="text-white font-semibold mb-4">Add Position</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Position management coming soon. Edit <code>src/context/PortfolioContext.jsx</code> to update your holdings.
        </p>
        <button onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent)', color: 'white' }}>
          Close
        </button>
      </div>
    </div>
  )
}
