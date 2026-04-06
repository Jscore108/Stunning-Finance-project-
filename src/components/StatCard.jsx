import React, { useEffect, useRef, useState } from 'react'
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

function useAnimatedValue(value) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value === prevRef.current) return
    prevRef.current = value
    setDisplayed(value)
  }, [value])

  return displayed
}

export default function StatCard({ label, value, subValue, change, icon: Icon, accent }) {
  const isPositive = change >= 0
  const animatedValue = useAnimatedValue(value)
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card stat-glow p-3 md:p-5 flex flex-col gap-2 md:gap-3 relative overflow-hidden transition-all duration-300 group"
      style={{ cursor: 'default' }}
    >
      {/* Background glow orb */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full transition-all duration-500 pointer-events-none"
        style={{
          background: accent || 'rgba(59,130,246,0.15)',
          filter: 'blur(30px)',
          opacity: hovered ? 0.3 : 0.1,
        }} />

      {/* Gradient top border on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
          opacity: hovered ? 1 : 0,
        }} />

      <div className="flex items-center justify-between relative z-10">
        <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: accent || 'rgba(59,130,246,0.1)',
              color: accent ? 'white' : '#60a5fa',
              boxShadow: hovered ? '0 0 16px rgba(59,130,246,0.2)' : 'none',
            }}>
            <Icon size={13} />
          </div>
        )}
      </div>
      <div className="relative z-10">
        <div className="font-bold text-white number-font counter-animate" style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>
          {animatedValue}
        </div>
        {subValue && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subValue}</div>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium relative z-10 ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span className="px-1.5 py-0.5 rounded-md" style={{
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          }}>
            {fmtPct(change)} 24h
          </span>
        </div>
      )}
    </div>
  )
}
