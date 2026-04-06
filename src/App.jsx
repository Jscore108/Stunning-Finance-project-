import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ChartsPage from './components/ChartsPage'
import WatchlistPage from './components/WatchlistPage'
import MarketOverview from './components/MarketOverview'
import PositionsTable from './components/PositionsTable'
import NewsPage from './components/NewsPage'
import IndicatorsPage from './components/IndicatorsPage'
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext'
import { usePrices, useCoinDetails } from './hooks/usePrices'

function AnimatedBackground() {
  // Generate random but stable node positions for the network mesh
  const nodes = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 8,
      duration: 15 + Math.random() * 20,
    }))
  ).current

  // Build connections between nearby nodes
  const connections = useRef(() => {
    const conns = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 22) {
          conns.push({ from: nodes[i], to: nodes[j], dist })
        }
      }
    }
    return conns
  }).current()

  // Hexagon points for decorative shapes
  const hexPoints = (cx, cy, r) => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Deep gradient base */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 60% 30%, rgba(16,185,129,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* Animated geometric grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        animation: 'gridPulse 8s ease-in-out infinite',
      }} />

      {/* Diagonal accent lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.08)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139,92,246,0)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.06)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </linearGradient>
        </defs>
        {/* Diagonal lines */}
        <line x1="0%" y1="30%" x2="100%" y2="70%" stroke="url(#lineGrad1)" strokeWidth="0.5" />
        <line x1="0%" y1="50%" x2="100%" y2="90%" stroke="url(#lineGrad1)" strokeWidth="0.5" />
        <line x1="10%" y1="0%" x2="90%" y2="100%" stroke="url(#lineGrad2)" strokeWidth="0.5" />
        <line x1="40%" y1="0%" x2="100%" y2="60%" stroke="url(#lineGrad2)" strokeWidth="0.5" />
      </svg>

      {/* Network mesh — connected nodes */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="rgba(96,165,250,0.8)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, i) => (
          <line
            key={`conn-${i}`}
            x1={`${conn.from.x}%`} y1={`${conn.from.y}%`}
            x2={`${conn.to.x}%`} y2={`${conn.to.y}%`}
            stroke="rgba(59,130,246,0.08)"
            strokeWidth="0.5"
            style={{
              animation: `connectionPulse ${6 + (i % 4) * 2}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            {/* Outer glow */}
            <circle
              cx={`${node.x}%`} cy={`${node.y}%`} r={node.size * 3}
              fill="url(#nodeGlow)"
              style={{
                animation: `nodePulse ${node.duration}s ease-in-out ${node.delay}s infinite`,
                transformOrigin: `${node.x}% ${node.y}%`,
              }}
            />
            {/* Core dot */}
            <circle
              cx={`${node.x}%`} cy={`${node.y}%`} r={node.size * 0.6}
              fill="rgba(96,165,250,0.5)"
              style={{
                animation: `nodePulse ${node.duration}s ease-in-out ${node.delay}s infinite`,
                transformOrigin: `${node.x}% ${node.y}%`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Floating geometric shapes */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
        {/* Hexagons */}
        <polygon
          points={hexPoints(15, 20, 4)}
          fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="0.5"
          style={{ animation: 'floatHex 20s ease-in-out infinite', transformOrigin: '15% 20%' }}
        />
        <polygon
          points={hexPoints(75, 15, 6)}
          fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="0.5"
          style={{ animation: 'floatHex 25s ease-in-out -5s infinite', transformOrigin: '75% 15%' }}
        />
        <polygon
          points={hexPoints(85, 65, 5)}
          fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"
          style={{ animation: 'floatHex 22s ease-in-out -10s infinite', transformOrigin: '85% 65%' }}
        />
        <polygon
          points={hexPoints(25, 75, 7)}
          fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="0.5"
          style={{ animation: 'floatHex 28s ease-in-out -3s infinite', transformOrigin: '25% 75%' }}
        />
        <polygon
          points={hexPoints(55, 45, 3.5)}
          fill="none" stroke="rgba(236,72,153,0.08)" strokeWidth="0.5"
          style={{ animation: 'floatHex 18s ease-in-out -8s infinite', transformOrigin: '55% 45%' }}
        />

        {/* Triangles */}
        <polygon
          points="45,8 48,14 42,14"
          fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5"
          style={{ animation: 'floatTri 24s ease-in-out infinite' }}
        />
        <polygon
          points="90,40 94,48 86,48"
          fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"
          style={{ animation: 'floatTri 20s ease-in-out -6s infinite' }}
        />

        {/* Small diamonds */}
        <polygon
          points="60,85 62,88 60,91 58,88"
          fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth="0.5"
          style={{ animation: 'floatHex 22s ease-in-out -12s infinite' }}
        />
        <polygon
          points="30,40 32,43 30,46 28,43"
          fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"
          style={{ animation: 'floatTri 26s ease-in-out -4s infinite' }}
        />

        {/* Dashed circles — radar/scope aesthetic */}
        <circle cx="20%" cy="30%" r="80" fill="none"
          stroke="rgba(59,130,246,0.04)" strokeWidth="0.5" strokeDasharray="4 6"
          style={{ animation: 'radarSpin 60s linear infinite', transformOrigin: '20% 30%' }} />
        <circle cx="70%" cy="70%" r="100" fill="none"
          stroke="rgba(139,92,246,0.03)" strokeWidth="0.5" strokeDasharray="3 8"
          style={{ animation: 'radarSpin 80s linear -10s infinite reverse', transformOrigin: '70% 70%' }} />
        <circle cx="50%" cy="20%" r="60" fill="none"
          stroke="rgba(16,185,129,0.03)" strokeWidth="0.5" strokeDasharray="2 5"
          style={{ animation: 'radarSpin 50s linear -20s infinite', transformOrigin: '50% 20%' }} />
      </svg>

      {/* Scanning line effect */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, transparent 45%, rgba(59,130,246,0.03) 50%, transparent 55%, transparent 100%)',
        backgroundSize: '100% 200%',
        animation: 'scanLine 12s ease-in-out infinite',
      }} />

      {/* Floating gradient orbs (kept but refined) */}
      <div className="glow-orb" style={{
        width: 350, height: 350, top: '5%', left: '8%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)',
        animationDelay: '0s', animationDuration: '30s',
      }} />
      <div className="glow-orb" style={{
        width: 300, height: 300, top: '55%', right: '5%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)',
        animationDelay: '-10s', animationDuration: '35s',
      }} />
      <div className="glow-orb" style={{
        width: 250, height: 250, bottom: '15%', left: '25%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)',
        animationDelay: '-18s', animationDuration: '28s',
      }} />

      {/* Vignette overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(10,14,26,0.5) 100%)',
      }} />
    </div>
  )
}

function PageTransition({ page, children }) {
  const [rendered, setRendered] = useState(children)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    setAnimKey(k => k + 1)
    setRendered(children)
  }, [page])

  return (
    <div key={animKey} className="page-enter">
      {rendered}
    </div>
  )
}

function AppInner() {
  const [page, setPage] = useState('dashboard')
  const { positions, watchlist, removePosition } = usePortfolio()

  const allIds = [...new Set([...positions.map(p => p.id), ...watchlist])]

  const { prices, loading: pricesLoading, lastUpdated, error, refresh } = usePrices(allIds)
  const { details, loading: detailsLoading } = useCoinDetails(allIds)

  const loading = pricesLoading || detailsLoading

  const totalValue = positions.reduce((sum, pos) => {
    const p = prices[pos.id]
    const d = details[pos.id]
    const price = p?.usd ?? d?.current_price ?? 0
    return sum + price * pos.amount
  }, 0)

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard prices={prices} details={details} loading={loading} />
      case 'portfolio':
        return (
          <div className="p-3 md:p-6">
            <PositionsTable
              positions={positions}
              prices={prices}
              details={details}
              totalValue={totalValue}
              onRemove={removePosition}
            />
          </div>
        )
      case 'markets':
        return (
          <div className="p-3 md:p-6">
            <MarketOverview watchlist={watchlist} details={details} prices={prices} />
          </div>
        )
      case 'charts':
        return <ChartsPage prices={prices} details={details} />
      case 'watchlist':
        return <WatchlistPage watchlist={watchlist} details={details} prices={prices} />
      case 'news':
        return <NewsPage />
      case 'indicators':
        return <IndicatorsPage positions={positions} prices={prices} />
      default:
        return <Dashboard prices={prices} details={details} loading={loading} />
    }
  }

  return (
    <div className="flex min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      <AnimatedBackground />

      <Sidebar active={page} onNav={setPage} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden relative" style={{ zIndex: 1 }}>
        <Header page={page} lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refresh} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ background: 'transparent' }}>
          <PageTransition page={page}>
            {renderPage()}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppInner />
    </PortfolioProvider>
  )
}
