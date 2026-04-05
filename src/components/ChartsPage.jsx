import React from 'react'
import PriceChart from './PriceChart'
import { usePortfolio } from '../context/PortfolioContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { fmt$, fmtPct } from './StatCard'

const COIN_COLORS = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', LINK: '#2a5ada',
  ADA: '#0d1e7e', AVAX: '#e84142', DOT: '#e6007a', UNI: '#ff007a',
}

export default function ChartsPage({ prices, details }) {
  const { positions } = usePortfolio()

  // P&L bar chart data
  const pnlData = positions.map(pos => {
    const p = prices[pos.id]
    const d = details[pos.id]
    const price = p?.usd ?? d?.current_price ?? 0
    const value = price * pos.amount
    const cost = pos.avgBuyPrice * pos.amount
    const pnl = value - cost
    const pnlPct = cost ? (pnl / cost) * 100 : 0
    return { symbol: pos.symbol, pnl, pnlPct, color: COIN_COLORS[pos.symbol] || '#3b82f6' }
  }).filter(d => d.pnl !== 0).sort((a, b) => b.pnl - a.pnl)

  // 24h change bar
  const changeData = positions.map(pos => {
    const p = prices[pos.id]
    const d = details[pos.id]
    const change = p?.usd_24h_change ?? d?.price_change_percentage_24h ?? 0
    return { symbol: pos.symbol, change, color: COIN_COLORS[pos.symbol] || '#3b82f6' }
  }).sort((a, b) => b.change - a.change)

  return (
    <div className="flex flex-col gap-5 p-6">
      <PriceChart positions={positions} prices={prices} details={details} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* P&L Bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-1">P&L by Position</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Unrealized profit/loss per asset</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false} />
                <XAxis dataKey="symbol" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 0 ? `+$${(Math.abs(v)/1000).toFixed(1)}k` : `-$${(Math.abs(v)/1000).toFixed(1)}k`} width={55} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmt$(v), 'P&L']}
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {pnlData.map((entry) => (
                    <Cell key={entry.symbol} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24h Change Bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-1">24h Price Change</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Percentage change per asset</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={changeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false} />
                <XAxis dataKey="symbol" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} width={50} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmtPct(v), '24h Change']}
                />
                <Bar dataKey="change" radius={[3, 3, 0, 0]}>
                  {changeData.map((entry) => (
                    <Cell key={entry.symbol} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
