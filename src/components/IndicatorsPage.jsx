import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useIndicators } from '../hooks/useIndicators'
import { fmt$, fmtPct } from './StatCard'
import {
  Target, TrendingUp, TrendingDown, Info, ExternalLink,
  Zap, Shield, AlertTriangle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Zone configs
// ---------------------------------------------------------------------------
const FNG_ZONES = [
  { from: 0,  to: 25,  color: '#ef4444' },
  { from: 25, to: 45,  color: '#f97316' },
  { from: 45, to: 55,  color: '#eab308' },
  { from: 55, to: 75,  color: '#84cc16' },
  { from: 75, to: 100, color: '#22c55e' },
]
const RSI_ZONES = [
  { from: 0,  to: 30,  color: '#22c55e' },
  { from: 30, to: 70,  color: '#eab308' },
  { from: 70, to: 100, color: '#ef4444' },
]
const MVRV_ZONES = [
  { from: 0,  to: 25,  color: '#22c55e' },
  { from: 25, to: 55,  color: '#eab308' },
  { from: 55, to: 80,  color: '#f97316' },
  { from: 80, to: 100, color: '#ef4444' },
]
const ALT_ZONES = [
  { from: 0,  to: 25,  color: '#3b82f6' },
  { from: 25, to: 50,  color: '#a855f7' },
  { from: 50, to: 75,  color: '#ec4899' },
  { from: 75, to: 100, color: '#22c55e' },
]

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end   = polarToCartesian(cx, cy, r, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

function Gauge({ value = 0, label, sublabel, color = '#22c55e', zones = [] }) {
  const cx = 100, cy = 90, r = 70
  const startAngle = -135
  const endAngle   = 135
  const totalSpan  = endAngle - startAngle

  const needleAngle = startAngle + (Math.min(Math.max(value, 0), 100) / 100) * totalSpan
  const needleEnd   = polarToCartesian(cx, cy, r - 8, needleAngle)
  const glowId = `gauge-glow-${label?.replace(/\s/g, '') || 'default'}`

  return (
    <div className="card p-3 flex flex-col items-center gap-1 hover-lift group">
      <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, r, startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Zone arcs */}
        {zones.map((z, i) => {
          const zStart = startAngle + (z.from / 100) * totalSpan
          const zEnd   = startAngle + (z.to   / 100) * totalSpan
          return (
            <path
              key={i}
              d={describeArc(cx, cy, r, zStart, zEnd)}
              fill="none"
              stroke={z.color}
              strokeWidth={16}
              strokeLinecap="butt"
              opacity={0.75}
            />
          )
        })}
        {/* Needle with glow */}
        <line
          x1={cx} y1={cy}
          x2={needleEnd.x} y2={needleEnd.y}
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        <circle cx={cx} cy={cy} r={6} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {/* Value text */}
        <text
          x={cx} y={cy + 24}
          textAnchor="middle"
          fill="white"
          fontSize={24}
          fontWeight="bold"
          fontFamily="var(--font-number, monospace)"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        >
          {Math.round(value)}
        </text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sublabel}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CycleScoreBar
// ---------------------------------------------------------------------------
function cycleLabel(score) {
  if (score < 40) return { text: 'Early Bull', color: '#22c55e' }
  if (score < 65) return { text: 'Mid Bull',   color: '#eab308' }
  if (score < 80) return { text: 'Late Bull / Distribution', color: '#f97316' }
  return { text: 'Cycle Top Zone', color: '#ef4444' }
}

function CycleScoreBar({ score = 0 }) {
  const { text, color } = cycleLabel(score)
  const pct = Math.min(Math.max(score, 0), 100)
  return (
    <div className="card p-4 md:p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}15, transparent 70%)`, filter: 'blur(40px)' }} />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 500 }}>
            Cycle Score
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Composite indicator (RSI + F&G + MVRV + Pi Cycle)
          </div>
        </div>
        <div className="number-font" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, color, lineHeight: 1, textShadow: `0 0 20px ${color}40` }}>
          {score}
          <span style={{ fontSize: '0.4em', color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
        </div>
      </div>
      {/* Track */}
      <div className="relative z-10" style={{ position: 'relative', height: 20, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #22c55e 0%, #eab308 40%, #f97316 65%, #ef4444 80%, #b91c1c 100%)',
          borderRadius: 10,
          transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: `0 0 12px ${color}40`,
        }} />
        {[40, 65, 80].map(m => (
          <div key={m} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${m}%`,
            width: 2, background: 'rgba(0,0,0,0.4)',
          }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 relative z-10" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Accumulation</span>
        <span>Early Bull</span>
        <span>Mid Bull</span>
        <span>Late Bull</span>
        <span>Top Zone</span>
      </div>
      <div className="mt-3 flex items-center gap-2 relative z-10">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{text}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Signal
// ---------------------------------------------------------------------------
const SIGNAL_STYLES = {
  bullish: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', label: 'Bullish' },
  bearish: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#ef4444', label: 'Bearish' },
  neutral: { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.4)',  text: '#eab308', label: 'Neutral' },
  warning: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#f97316', label: 'Warning' },
}

function Signal({ label, value, signal = 'neutral', description, link }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES.neutral
  return (
    <div className="card card-hover p-3 md:p-4 flex flex-col gap-2 group relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: s.text, filter: 'blur(20px)', opacity: 0.1 }} />

      <div className="flex items-start justify-between gap-2 relative z-10">
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{label}</div>
        <span className="transition-transform duration-300 group-hover:scale-105" style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: s.bg, border: `1px solid ${s.border}`, color: s.text,
          whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: `0 0 8px ${s.text}20`,
        }}>
          {s.label}
        </span>
      </div>
      <div className="number-font relative z-10" style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{value}</div>
      {description && (
        <div className="relative z-10" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</div>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 mt-auto relative z-10 transition-all duration-300 hover:gap-2"
          style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}
        >
          View Live <ExternalLink size={10} />
        </a>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SellZoneTable
// ---------------------------------------------------------------------------
const SELL_ZONES = [
  { btcPrice: 280000, label: 'Early Warning',       sellPct: 10, color: '#f59e0b' },
  { btcPrice: 320000, label: 'Start Scaling',       sellPct: 15, color: '#f97316' },
  { btcPrice: 370000, label: 'Accelerate',          sellPct: 20, color: '#ef4444' },
  { btcPrice: 400000, label: 'Target Low \u2605',   sellPct: 25, color: '#dc2626' },
  { btcPrice: 425000, label: 'Target Mid \u2605',   sellPct: 20, color: '#b91c1c' },
  { btcPrice: 450000, label: 'Target High / Exit',  sellPct: 10, color: '#7f1d1d' },
]

function SellZoneTable({ currentPrice = 0, positions = [], prices = {} }) {
  const btcAmount = positions
    .filter(p => p.id === 'bitcoin')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const TARGET_LOW  = 400000
  const progressPct = currentPrice > 0
    ? Math.min((currentPrice / TARGET_LOW) * 100, 100)
    : 0
  const pctToTarget = currentPrice > 0
    ? ((TARGET_LOW - currentPrice) / currentPrice) * 100
    : 0

  const btcValueAtTarget = btcAmount * TARGET_LOW

  let cumulative = 0
  const zones = SELL_ZONES.map(z => {
    const btcValue      = btcAmount * z.btcPrice
    const pctGainNeeded = currentPrice > 0 ? ((z.btcPrice - currentPrice) / currentPrice) * 100 : 0
    const btcToSell     = btcAmount * (z.sellPct / 100)
    const proceeds      = btcToSell * z.btcPrice
    cumulative         += proceeds
    return { ...z, btcValue, pctGainNeeded, btcToSell, proceeds, cumulative }
  })

  const totalProceeds = zones.reduce((s, z) => s + z.proceeds, 0)

  return (
    <div className="card p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} style={{ color: '#f59e0b' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>BTC Sell Zone Planner</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target: $400,000 &ndash; $450,000</div>
        </div>
      </div>

      {/* Progress toward target */}
      <div className="mb-4">
        <div className="flex justify-between mb-1" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Progress toward $400k target</span>
          <span className="number-font" style={{ color: 'var(--text-secondary)' }}>
            {progressPct.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
            borderRadius: 5,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5">
        <div className="rounded-xl p-2 md:p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BTC Price</div>
          <div className="number-font font-bold" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)', color: 'white', marginTop: 2 }}>
            {fmt$(currentPrice, 0)}
          </div>
        </div>
        <div className="rounded-xl p-2 md:p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>% to $400k</div>
          <div className="number-font font-bold" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)', color: pctToTarget > 0 ? '#f59e0b' : '#22c55e', marginTop: 2 }}>
            {pctToTarget > 0 ? `+${pctToTarget.toFixed(1)}%` : 'Reached!'}
          </div>
        </div>
        <div className="rounded-xl p-2 md:p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value @ Target</div>
          <div className="number-font font-bold" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)', color: 'white', marginTop: 2 }}>
            {fmt$(btcValueAtTarget, 0)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Zone', 'BTC Price', '% Gain Needed', 'BTC Value', 'Sell %', 'Proceeds', 'Cumulative'].map(col => (
                <th key={col} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{z.label}</span>
                  </div>
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: z.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {fmt$(z.btcPrice, 0)}
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: z.pctGainNeeded > 0 ? '#f59e0b' : '#22c55e', whiteSpace: 'nowrap' }}>
                  {z.pctGainNeeded > 0 ? `+${z.pctGainNeeded.toFixed(1)}%` : 'Reached'}
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: 'white', whiteSpace: 'nowrap' }}>
                  {fmt$(z.btcValue, 0)}
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {z.sellPct}%
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: '#22c55e', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {fmt$(z.proceeds, 0)}
                </td>
                <td className="number-font" style={{ padding: '7px 8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {fmt$(z.cumulative, 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
              <td colSpan={3} style={{ padding: '8px 8px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                Total BTC Holdings: <span className="number-font" style={{ color: 'white' }}>{btcAmount.toFixed(8)} BTC</span>
              </td>
              <td colSpan={2} style={{ padding: '8px 8px', color: 'var(--text-muted)', fontSize: 12 }} />
              <td colSpan={2} style={{ padding: '8px 8px', fontWeight: 700, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Est. Total: </span>
                <span className="number-font" style={{ color: '#22c55e' }}>{fmt$(totalProceeds, 0)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Note */}
      <div className="mt-3 flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <Info size={13} style={{ color: '#eab308', marginTop: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#eab308', lineHeight: 1.4 }}>
          Keep 5&ndash;10% as lottery ticket for $500k+ overshoot
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FearGreedChart
// ---------------------------------------------------------------------------
function FearGreedChart({ data = [] }) {
  if (!data || data.length === 0) return null
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} style={{ color: '#f59e0b' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Fear &amp; Greed Index &mdash; 30 Days</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Current: <span className="number-font" style={{ color: 'white' }}>{data[data.length - 1]?.value}</span>
            {' '}&mdash; {data[data.length - 1]?.label}
          </div>
        </div>
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fngGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-muted)' }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Fear', fill: '#ef4444', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Greed', fill: '#22c55e', fontSize: 10, position: 'right' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#fngGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main IndicatorsPage
// ---------------------------------------------------------------------------
export default function IndicatorsPage({ positions = [], prices = {} }) {
  const { data, loading, error, retry } = useIndicators()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="relative">
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <div className="absolute inset-0 rounded-full" style={{ border: '3px solid transparent', borderBottomColor: '#8b5cf6', animation: 'spin 1.2s linear infinite reverse' }} />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading indicators&hellip;</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-6" style={{ animation: 'pageIn 0.4s ease' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <AlertTriangle size={28} style={{ color: '#f97316' }} />
        </div>
        <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Failed to load indicators</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', maxWidth: 380 }}>{error}</div>
        <button onClick={retry}
          className="transition-all duration-300 active:scale-95 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Retry Now
        </button>
        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>CoinGecko free API allows ~10 requests/min. Wait 60s if retrying.</div>
      </div>
    )
  }

  const {
    currentPrice = 0,
    rsi = 50,
    cycleScore = 0,
    btcDominance = 50,
    totalMarketCap = 0,
    ma50 = 0,
    ma200 = 0,
    piCycle,
    mvrvEst = 2,
    altSeasonScore = 50,
    currentFng = {},
    fngHistory = [],
  } = data || {}

  // Normalize MVRV (0-7) to 0-100 for gauge
  const mvrvPct = Math.min((mvrvEst / 7) * 100, 100)

  // RSI gauge: map 0-100 RSI directly
  const rsiVal = rsi != null ? rsi : 50

  // Pi Cycle signal
  const piGap = piCycle?.gap ?? null
  const piSignal = piGap == null ? 'neutral'
    : piGap > -5 && piGap < 5 ? 'warning'
    : piGap <= -5             ? 'bullish'
    :                           'bearish'
  const piValue = piGap != null
    ? `Gap: ${piGap > 0 ? '+' : ''}${piGap.toFixed(2)}%`
    : 'Insufficient data'

  // MA cross signal
  const maCross = ma50 && ma200
    ? (ma50 > ma200 ? 'bullish' : 'bearish')
    : 'neutral'
  const maCrossValue = ma50 && ma200
    ? `MA50 ${ma50 > ma200 ? '>' : '<'} MA200 (${fmtPct(((ma50 - ma200) / ma200) * 100)})`
    : 'Loading\u2026'

  // BTC Dominance signal
  const domSignal = btcDominance > 55 ? 'bearish' : btcDominance < 45 ? 'bullish' : 'neutral'

  // MVRV signal
  const mvrvSignal = mvrvEst < 2 ? 'bullish' : mvrvEst < 4 ? 'neutral' : mvrvEst < 6 ? 'warning' : 'bearish'

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-3 md:p-6 stagger-in">
      {/* 1. Cycle Score */}
      <CycleScoreBar score={cycleScore} />

      {/* 2. Sell Zone Table */}
      <SellZoneTable currentPrice={currentPrice} positions={positions} prices={prices} />

      {/* 3. Gauges */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
          Cycle Gauges
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Gauge
            value={currentFng?.value ?? 50}
            label="Fear &amp; Greed"
            sublabel={currentFng?.label ?? ''}
            color="#f59e0b"
            zones={FNG_ZONES}
          />
          <Gauge
            value={rsiVal}
            label="RSI 14D"
            sublabel={rsiVal < 30 ? 'Oversold' : rsiVal > 70 ? 'Overbought' : 'Neutral'}
            color={rsiVal < 30 ? '#22c55e' : rsiVal > 70 ? '#ef4444' : '#eab308'}
            zones={RSI_ZONES}
          />
          <Gauge
            value={mvrvPct}
            label="MVRV Est."
            sublabel={`MVRV \u2248 ${mvrvEst.toFixed(2)}`}
            color={mvrvPct < 50 ? '#22c55e' : mvrvPct < 75 ? '#f97316' : '#ef4444'}
            zones={MVRV_ZONES}
          />
          <Gauge
            value={altSeasonScore}
            label="Alt Season Index"
            sublabel={altSeasonScore > 60 ? 'Alt Season' : 'BTC Season'}
            color={altSeasonScore > 60 ? '#a855f7' : '#3b82f6'}
            zones={ALT_ZONES}
          />
        </div>
      </div>

      {/* 4. Signal Cards */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
          On-Chain &amp; Technical Signals
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Signal
            label="Pi Cycle Top"
            value={piValue}
            signal={piSignal}
            description={
              piGap != null
                ? piGap > 0
                  ? 'MA111 above 2\u00d7MA350 \u2014 potential top signal active'
                  : 'MA111 below 2\u00d7MA350 \u2014 gap narrowing as price rises'
                : 'Need 350+ days of price data'
            }
            link="https://lookintobitcoin.com/charts/pi-cycle-top-indicator/"
          />
          <Signal
            label="Golden / Death Cross"
            value={maCrossValue}
            signal={maCross}
            description={
              maCross === 'bullish'
                ? 'Golden Cross active \u2014 50 DMA above 200 DMA (bullish trend)'
                : maCross === 'bearish'
                  ? 'Death Cross \u2014 50 DMA below 200 DMA (bearish trend)'
                  : 'MA data loading\u2026'
            }
            link="https://tradingview.com"
          />
          <Signal
            label="BTC Dominance"
            value={`${btcDominance.toFixed(1)}% BTC.D`}
            signal={domSignal}
            description={
              btcDominance > 55
                ? 'High dominance \u2014 capital concentrated in BTC, alts lagging'
                : btcDominance < 45
                  ? 'Low dominance \u2014 alt season conditions forming'
                  : 'Mid-range dominance \u2014 balanced market'
            }
            link="https://coinmarketcap.com/charts/"
          />
          <Signal
            label="MVRV Z-Score Est."
            value={`MVRV \u2248 ${mvrvEst.toFixed(2)}`}
            signal={mvrvSignal}
            description={
              mvrvEst < 2
                ? 'Undervalued zone \u2014 historically strong buy signal'
                : mvrvEst < 4
                  ? 'Fair value range \u2014 healthy bull market territory'
                  : mvrvEst < 6
                    ? 'Elevated \u2014 approaching distribution zone'
                    : 'Danger zone \u2014 historically near cycle top'
            }
            link="https://lookintobitcoin.com/charts/mvrv-zscore/"
          />
          <Signal
            label="Total Market Cap"
            value={fmt$(totalMarketCap)}
            signal="neutral"
            description="Global crypto market capitalization (live)"
            link="https://coinmarketcap.com/charts/"
          />
          <Signal
            label="Stock-to-Flow"
            value="Post-halving / Bullish"
            signal="bullish"
            description="April 2024 halving \u2014 S2F model points to continued upside through 2025"
            link="https://lookintobitcoin.com/charts/stock-to-flow-model/"
          />
          <Signal
            label="Puell Multiple"
            value="View Live \u2192"
            signal="neutral"
            description="Miner revenue relative to historical average \u2014 top signal when elevated"
            link="https://lookintobitcoin.com/charts/puell-multiple/"
          />
          <Signal
            label="Rainbow Chart"
            value="View Live \u2192"
            signal="neutral"
            description="Logarithmic price bands \u2014 shows long-term price position in the cycle"
            link="https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/"
          />
          <Signal
            label="2Y MA Multiplier"
            value="View Live \u2192"
            signal="neutral"
            description="Price vs 2-year MA and 5\u00d7 multiplier \u2014 classic cycle top/bottom tool"
            link="https://lookintobitcoin.com/charts/bitcoin-investor-tool/"
          />
        </div>
      </div>

      {/* 5. Fear & Greed Chart */}
      <FearGreedChart data={fngHistory} />

      {/* 6. Disclaimer */}
      <div className="card p-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="flex items-start gap-3">
          <Shield size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
              Disclaimer &mdash; Not Financial Advice
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              These indicators are for informational purposes only and do not constitute financial advice.
              Crypto markets are highly volatile and past performance does not guarantee future results.
              On-chain estimates (MVRV, Pi Cycle) are approximations derived from public price data.
              Always do your own research and consult a qualified financial advisor before making investment decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
