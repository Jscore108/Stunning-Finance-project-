import React, { useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from 'recharts'
import { useIndicators } from '../hooks/useIndicators'
import { fmt$, fmtPct } from './StatCard'
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react'

const BTC_TARGET_LOW  = 400000
const BTC_TARGET_HIGH = 450000

// ── Gauge ──────────────────────────────────────────────────────────────────
function Gauge({ value, min = 0, max = 100, label, sublabel, color, zones }) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
  const angle = -135 + pct * 270
  const r = 54, cx = 70, cy = 70
  const toRad = deg => (deg * Math.PI) / 180
  const arcPath = (startDeg, endDeg, col) => {
    const s = toRad(startDeg - 90), e = toRad(endDeg - 90)
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return <path key={col} d={`M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
      fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" />
  }
  const needleX = cx + (r - 14) * Math.cos(toRad(angle - 90))
  const needleY = cy + (r - 14) * Math.sin(toRad(angle - 90))

  return (
    <div className="card p-4 flex flex-col items-center gap-1">
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <svg width={140} height={90} viewBox="0 0 140 90">
        {/* Background arc */}
        {arcPath(-135, 135, 'var(--border)')}
        {/* Zone arcs */}
        {zones && zones.map(z => arcPath(
          -135 + (z.from / 100) * 270,
          -135 + (z.to / 100) * 270,
          z.color
        ))}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="white" />
        {/* Value */}
        <text x={cx} y={cy + 20} textAnchor="middle" fill="white" fontSize={15} fontWeight={700}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
      </svg>
      <div className="text-xs font-medium" style={{ color }}>{sublabel}</div>
    </div>
  )
}

// ── Signal badge ───────────────────────────────────────────────────────────
function Signal({ label, value, signal, description, link }) {
  const colors = { bullish: '#10b981', bearish: '#ef4444', neutral: '#f59e0b', warning: '#f97316' }
  const col = colors[signal] || colors.neutral
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
            <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
          </a>
        )}
      </div>
      <div className="text-lg font-bold number-font" style={{ color: col }}>{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{description}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
          style={{ background: `${col}18`, color: col, border: `1px solid ${col}33` }}>
          {signal}
        </span>
      </div>
    </div>
  )
}

// ── Target Progress ────────────────────────────────────────────────────────
function TargetTracker({ currentPrice, positions, prices }) {
  const portfolioAtPrice = (targetPrice) => {
    if (!positions || !prices) return 0
    return positions.reduce((sum, pos) => {
      const ratio = targetPrice / (currentPrice || 1)
      const currentVal = (prices[pos.id]?.usd ?? 0) * pos.amount
      // For BTC scale the whole portfolio proportionally (simplified)
      return sum + currentVal
    }, 0)
  }

  const pctToLow  = currentPrice ? ((BTC_TARGET_LOW  - currentPrice) / currentPrice * 100) : 0
  const pctToHigh = currentPrice ? ((BTC_TARGET_HIGH - currentPrice) / currentPrice * 100) : 0
  const progress  = currentPrice ? Math.min((currentPrice / BTC_TARGET_LOW) * 100, 100) : 0

  const SELL_ZONES = [
    { label: 'Zone 1 — Early',    range: '$350k–$380k', pct: '15–20%',  action: 'Scale out 15–20% of BTC holdings', color: '#f59e0b', signal: 'Prepare' },
    { label: 'Zone 2 — Target Low',  range: '$380k–$410k', pct: '25–30%',  action: 'Sell 25–30% — target entry zone', color: '#f97316', signal: 'Sell' },
    { label: 'Zone 3 — Target Mid',  range: '$410k–$430k', pct: '25–30%',  action: 'Continue distributing 25–30%',    color: '#ef4444', signal: 'Sell Hard' },
    { label: 'Zone 4 — Target High', range: '$430k–$450k', pct: '20–25%',  action: 'Final distribution, keep 5–10% for run-on', color: '#dc2626', signal: 'Exit' },
  ]

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target size={18} style={{ color: '#3b82f6' }} />
        <div>
          <h2 className="font-semibold text-white">BTC Cycle Target Tracker</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Goal: $400,000 – $450,000</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          <span>Current: <span className="text-white font-semibold">{fmt$(currentPrice)}</span></span>
          <span>Target: <span className="font-semibold" style={{ color: '#60a5fa' }}>$400k–$450k</span></span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          {/* Progress fill */}
          <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
          {/* Target zone markers */}
          <div className="absolute top-0 h-full w-0.5" style={{ left: '88.9%', background: '#f59e0b' }} />
          <div className="absolute top-0 h-full w-0.5" style={{ left: '100%', background: '#ef4444' }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span style={{ color: 'var(--text-muted)' }}>$0</span>
          <span style={{ color: '#f59e0b' }}>$350k</span>
          <span style={{ color: '#ef4444' }}>$450k</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Progress</div>
          <div className="font-bold text-white number-font">{progress.toFixed(1)}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>to $400k</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Needed</div>
          <div className="font-bold number-font" style={{ color: '#60a5fa' }}>+{pctToLow.toFixed(1)}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>to $400k</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Full Target</div>
          <div className="font-bold number-font" style={{ color: '#8b5cf6' }}>+{pctToHigh.toFixed(1)}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>to $450k</div>
        </div>
      </div>

      {/* Sell zones */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Suggested Distribution Zones
        </div>
        <div className="flex flex-col gap-2">
          {SELL_ZONES.map((z, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-primary)', border: `1px solid ${z.color}22` }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: z.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">{z.label} <span style={{ color: z.color }}>{z.range}</span></div>
                <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{z.action}</div>
              </div>
              <div className="text-xs font-bold shrink-0" style={{ color: z.color }}>{z.pct}</div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.07)', color: 'var(--text-muted)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Info size={10} className="inline mr-1" />
          Strategy: Scale out in zones — never sell everything at once. Keep 5–10% as a lottery ticket for a potential overshoot above $450k.
        </p>
      </div>
    </div>
  )
}

// ── Fear & Greed Chart ─────────────────────────────────────────────────────
function FearGreedChart({ history }) {
  if (!history?.length) return null
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Fear & Greed — 30 Days</h3>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fngGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,74,0.5)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={6} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
              formatter={(v, n, p) => [v, p.payload.label]} />
            <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#fngGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Pi Cycle ───────────────────────────────────────────────────────────────
function PiCycleCard({ piCycle }) {
  if (!piCycle) return null
  const { ma111, ma350x2, gap, currentPrice } = piCycle
  const isTopped = gap >= 0
  const signal = isTopped ? 'bearish' : gap > -10 ? 'warning' : 'bullish'
  const signalText = isTopped ? 'CROSSED — Cycle Top Signal!' : gap > -10 ? 'Approaching Top' : 'Not Topped Yet'

  return (
    <Signal
      label="Pi Cycle Top"
      value={`${gap >= 0 ? '+' : ''}${gap.toFixed(1)}% gap`}
      signal={signal}
      description={`111DMA: ${fmt$(ma111)} | 2×350DMA: ${fmt$(ma350x2)}`}
      link="https://lookintobitcoin.com/charts/pi-cycle-top-indicator/"
    />
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function IndicatorsPage({ positions, prices }) {
  const { data, loading, error } = useIndicators()

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--text-muted)' }}>
      <div className="animate-pulse-slow">Loading market indicators…</div>
    </div>
  )
  if (error) return (
    <div className="p-6 text-sm" style={{ color: 'var(--red)' }}>Failed to load indicators: {error}</div>
  )

  const {
    currentPrice, change24h, btcDominance, ethDominance,
    ma50, ma200, rsi, piCycle, mvrvEst, altSeasonScore,
    fngHistory, currentFng, totalMarketCap,
  } = data

  const goldenCross = ma50 > ma200
  const rsiSignal = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral'
  const rsiLabel = rsi > 80 ? 'Extremely Overbought' : rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : rsi < 40 ? 'Approaching Oversold' : 'Neutral'
  const fngSignal = currentFng?.value > 75 ? 'bearish' : currentFng?.value < 25 ? 'bullish' : 'neutral'
  const domSignal = btcDominance < 45 ? 'bullish' : btcDominance > 60 ? 'bearish' : 'neutral'
  const mvrvSignal = mvrvEst > 6 ? 'bearish' : mvrvEst > 4 ? 'warning' : 'bullish'
  const mvrvLabel = mvrvEst > 6 ? 'Overvalued — Danger Zone' : mvrvEst > 4 ? 'Elevated' : mvrvEst > 2 ? 'Fair Value' : 'Undervalued'

  const MVRV_ZONES = [
    { from: 0, to: 25, color: '#10b981' },
    { from: 25, to: 55, color: '#f59e0b' },
    { from: 55, to: 80, color: '#f97316' },
    { from: 80, to: 100, color: '#ef4444' },
  ]
  const FNG_ZONES = [
    { from: 0, to: 25, color: '#ef4444' },
    { from: 25, to: 45, color: '#f97316' },
    { from: 45, to: 55, color: '#f59e0b' },
    { from: 55, to: 75, color: '#84cc16' },
    { from: 75, to: 100, color: '#10b981' },
  ]
  const RSI_ZONES = [
    { from: 0, to: 30, color: '#10b981' },
    { from: 30, to: 70, color: '#f59e0b' },
    { from: 70, to: 100, color: '#ef4444' },
  ]
  const ALT_ZONES = [
    { from: 0, to: 25, color: '#3b82f6' },
    { from: 25, to: 50, color: '#8b5cf6' },
    { from: 50, to: 75, color: '#ec4899' },
    { from: 75, to: 100, color: '#10b981' },
  ]

  return (
    <div className="flex flex-col gap-4 p-3 md:p-6">

      {/* Target Tracker — hero */}
      <TargetTracker currentPrice={currentPrice} positions={positions} prices={prices} />

      {/* Gauges row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Gauge
          label="Fear & Greed"
          value={currentFng?.value ?? 50}
          min={0} max={100}
          sublabel={currentFng?.label ?? '—'}
          color={currentFng?.value > 75 ? '#ef4444' : currentFng?.value < 25 ? '#10b981' : '#f59e0b'}
          zones={FNG_ZONES}
        />
        <Gauge
          label="RSI (14D)"
          value={rsi ?? 50}
          min={0} max={100}
          sublabel={rsiLabel}
          color={rsi > 70 ? '#ef4444' : rsi < 30 ? '#10b981' : '#f59e0b'}
          zones={RSI_ZONES}
        />
        <Gauge
          label="MVRV Est."
          value={((mvrvEst ?? 2) / 8) * 100}
          min={0} max={100}
          sublabel={mvrvLabel}
          color={mvrvEst > 6 ? '#ef4444' : mvrvEst > 4 ? '#f97316' : '#10b981'}
          zones={MVRV_ZONES}
        />
        <Gauge
          label="Alt Season"
          value={altSeasonScore}
          min={0} max={100}
          sublabel={altSeasonScore > 75 ? 'Alt Season!' : altSeasonScore > 50 ? 'Alt Favorable' : 'BTC Season'}
          color={altSeasonScore > 75 ? '#10b981' : altSeasonScore > 50 ? '#8b5cf6' : '#3b82f6'}
          zones={ALT_ZONES}
        />
      </div>

      {/* Signal cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <PiCycleCard piCycle={piCycle} />

        <Signal
          label="Golden / Death Cross"
          value={goldenCross ? 'Golden Cross ✓' : 'Death Cross ✗'}
          signal={goldenCross ? 'bullish' : 'bearish'}
          description={`50DMA: ${fmt$(ma50)} | 200DMA: ${fmt$(ma200)}`}
          link="https://www.tradingview.com/symbols/BTCUSD/"
        />

        <Signal
          label="BTC Dominance"
          value={`${btcDominance?.toFixed(1)}%`}
          signal={domSignal}
          description={btcDominance < 45 ? 'Alt season territory' : btcDominance > 58 ? 'BTC season — alts lagging' : 'Mixed market'}
          link="https://coinmarketcap.com/charts/"
        />

        <Signal
          label="MVRV Z-Score (est.)"
          value={mvrvEst?.toFixed(2)}
          signal={mvrvSignal}
          description={mvrvLabel + ' — Historical top: ~8'}
          link="https://lookintobitcoin.com/charts/mvrv-zscore/"
        />

        <Signal
          label="Total Crypto Market Cap"
          value={fmt$(totalMarketCap)}
          signal={totalMarketCap > 3e12 ? 'warning' : 'bullish'}
          description={totalMarketCap > 3e12 ? 'Near historic highs' : 'Room to grow'}
          link="https://coinmarketcap.com/charts/"
        />

        <Signal
          label="Stock-to-Flow"
          value="On Track"
          signal="bullish"
          description="Post-halving phase — S2F model bullish through 2025"
          link="https://lookintobitcoin.com/charts/stock-to-flow-model/"
        />

        <Signal
          label="Puell Multiple"
          value="View Live"
          signal="neutral"
          description="Miner revenue vs 365D avg — requires on-chain data"
          link="https://lookintobitcoin.com/charts/puell-multiple/"
        />

        <Signal
          label="Rainbow Chart"
          value="View Live"
          signal="neutral"
          description="Log regression bands — price vs long-term trend"
          link="https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/"
        />

        <Signal
          label="2-Year MA Multiplier"
          value="View Live"
          signal="neutral"
          description="Bull/bear market separator based on 2Y moving average"
          link="https://lookintobitcoin.com/charts/bitcoin-investor-tool/"
        />
      </div>

      {/* Fear & Greed Chart */}
      <FearGreedChart history={fngHistory} />

      {/* Disclaimer */}
      <div className="card p-4 text-xs" style={{ color: 'var(--text-muted)', borderColor: 'rgba(59,130,246,0.2)' }}>
        <span className="font-semibold text-white">Disclaimer: </span>
        MVRV estimate is approximated from price data (on-chain MVRV requires Glassnode).
        Pi Cycle, RSI, and MAs are calculated from CoinGecko price history.
        Fear & Greed is live from Alternative.me. This is not financial advice — always do your own research.
      </div>
    </div>
  )
}
