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
      {/* Vibrant gradient base with multiple color zones */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 15% 5%, rgba(59,130,246,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 85% 15%, rgba(139,92,246,0.14) 0%, transparent 50%),
          radial-gradient(ellipse 60% 70% at 75% 75%, rgba(236,72,153,0.1) 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 30% 80%, rgba(52,211,153,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 50% 40%, rgba(251,191,36,0.05) 0%, transparent 50%)
        `,
      }} />

      {/* Animated geometric grid — brighter */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        animation: 'gridPulse 8s ease-in-out infinite',
      }} />

      {/* Flowing color band across top */}
      <div className="absolute top-0 left-0 right-0 h-64" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 30%, rgba(236,72,153,0.05) 60%, rgba(251,191,36,0.03) 100%)',
        filter: 'blur(40px)',
      }} />

      {/* Diagonal accent lines — vibrant */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }}>
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="30%" stopColor="rgba(59,130,246,0.15)" />
            <stop offset="70%" stopColor="rgba(139,92,246,0.1)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0)" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139,92,246,0)" />
            <stop offset="40%" stopColor="rgba(236,72,153,0.1)" />
            <stop offset="60%" stopColor="rgba(251,191,36,0.08)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
          <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(52,211,153,0)" />
            <stop offset="50%" stopColor="rgba(52,211,153,0.08)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>
        <line x1="0%" y1="25%" x2="100%" y2="65%" stroke="url(#lineGrad1)" strokeWidth="0.8" />
        <line x1="0%" y1="50%" x2="100%" y2="85%" stroke="url(#lineGrad1)" strokeWidth="0.5" />
        <line x1="5%" y1="0%" x2="95%" y2="100%" stroke="url(#lineGrad2)" strokeWidth="0.8" />
        <line x1="35%" y1="0%" x2="100%" y2="55%" stroke="url(#lineGrad2)" strokeWidth="0.5" />
        <line x1="0%" y1="75%" x2="100%" y2="45%" stroke="url(#lineGrad3)" strokeWidth="0.5" />
      </svg>

      {/* Network mesh — vibrant connected nodes */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="nodeGlowBlue">
            <stop offset="0%" stopColor="rgba(96,165,250,1)" />
            <stop offset="50%" stopColor="rgba(96,165,250,0.3)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
          <radialGradient id="nodeGlowPurple">
            <stop offset="0%" stopColor="rgba(167,139,250,1)" />
            <stop offset="50%" stopColor="rgba(167,139,250,0.3)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0)" />
          </radialGradient>
          <radialGradient id="nodeGlowCyan">
            <stop offset="0%" stopColor="rgba(52,211,153,0.9)" />
            <stop offset="50%" stopColor="rgba(52,211,153,0.2)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </radialGradient>
        </defs>

        {/* Connection lines — colorful */}
        {connections.map((conn, i) => {
          const colors = ['rgba(59,130,246,0.12)', 'rgba(139,92,246,0.1)', 'rgba(52,211,153,0.08)', 'rgba(236,72,153,0.08)']
          return (
            <line
              key={`conn-${i}`}
              x1={`${conn.from.x}%`} y1={`${conn.from.y}%`}
              x2={`${conn.to.x}%`} y2={`${conn.to.y}%`}
              stroke={colors[i % colors.length]}
              strokeWidth="0.7"
              style={{
                animation: `connectionPulse ${5 + (i % 4) * 2}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          )
        })}

        {/* Nodes — multi-colored */}
        {nodes.map(node => {
          const glows = ['url(#nodeGlowBlue)', 'url(#nodeGlowPurple)', 'url(#nodeGlowCyan)']
          const dotColors = ['rgba(96,165,250,0.8)', 'rgba(167,139,250,0.7)', 'rgba(52,211,153,0.6)']
          const ci = node.id % 3
          return (
            <g key={node.id}>
              <circle
                cx={`${node.x}%`} cy={`${node.y}%`} r={node.size * 4}
                fill={glows[ci]}
                style={{
                  animation: `nodePulse ${node.duration}s ease-in-out ${node.delay}s infinite`,
                  transformOrigin: `${node.x}% ${node.y}%`,
                }}
              />
              <circle
                cx={`${node.x}%`} cy={`${node.y}%`} r={node.size * 0.8}
                fill={dotColors[ci]}
                style={{
                  animation: `nodePulse ${node.duration}s ease-in-out ${node.delay}s infinite`,
                  transformOrigin: `${node.x}% ${node.y}%`,
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Floating geometric shapes — vibrant */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.8 }}>
        {/* Hexagons — filled with faint color */}
        <polygon
          points={hexPoints(15, 20, 5)}
          fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8"
          style={{ animation: 'floatHex 20s ease-in-out infinite', transformOrigin: '15% 20%' }}
        />
        <polygon
          points={hexPoints(75, 15, 7)}
          fill="rgba(139,92,246,0.03)" stroke="rgba(139,92,246,0.18)" strokeWidth="0.8"
          style={{ animation: 'floatHex 25s ease-in-out -5s infinite', transformOrigin: '75% 15%' }}
        />
        <polygon
          points={hexPoints(85, 65, 6)}
          fill="rgba(236,72,153,0.02)" stroke="rgba(236,72,153,0.15)" strokeWidth="0.8"
          style={{ animation: 'floatHex 22s ease-in-out -10s infinite', transformOrigin: '85% 65%' }}
        />
        <polygon
          points={hexPoints(25, 78, 8)}
          fill="rgba(52,211,153,0.02)" stroke="rgba(52,211,153,0.12)" strokeWidth="0.8"
          style={{ animation: 'floatHex 28s ease-in-out -3s infinite', transformOrigin: '25% 78%' }}
        />
        <polygon
          points={hexPoints(55, 45, 4)}
          fill="rgba(251,191,36,0.02)" stroke="rgba(251,191,36,0.12)" strokeWidth="0.6"
          style={{ animation: 'floatHex 18s ease-in-out -8s infinite', transformOrigin: '55% 45%' }}
        />
        <polygon
          points={hexPoints(45, 88, 5)}
          fill="rgba(59,130,246,0.02)" stroke="rgba(59,130,246,0.14)" strokeWidth="0.6"
          style={{ animation: 'floatHex 24s ease-in-out -14s infinite', transformOrigin: '45% 88%' }}
        />

        {/* Triangles */}
        <polygon
          points="45,8 49,16 41,16"
          fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.18)" strokeWidth="0.7"
          style={{ animation: 'floatTri 24s ease-in-out infinite' }}
        />
        <polygon
          points="88,38 93,48 83,48"
          fill="rgba(139,92,246,0.02)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.7"
          style={{ animation: 'floatTri 20s ease-in-out -6s infinite' }}
        />
        <polygon
          points="10,55 14,62 6,62"
          fill="rgba(52,211,153,0.02)" stroke="rgba(52,211,153,0.12)" strokeWidth="0.6"
          style={{ animation: 'floatTri 22s ease-in-out -11s infinite' }}
        />

        {/* Diamonds */}
        <polygon
          points="60,83 63,88 60,93 57,88"
          fill="rgba(251,191,36,0.03)" stroke="rgba(251,191,36,0.15)" strokeWidth="0.7"
          style={{ animation: 'floatHex 22s ease-in-out -12s infinite' }}
        />
        <polygon
          points="30,38 33,43 30,48 27,43"
          fill="rgba(236,72,153,0.02)" stroke="rgba(236,72,153,0.12)" strokeWidth="0.6"
          style={{ animation: 'floatTri 26s ease-in-out -4s infinite' }}
        />

        {/* Radar circles — more visible */}
        <circle cx="20%" cy="30%" r="90" fill="none"
          stroke="rgba(59,130,246,0.08)" strokeWidth="0.6" strokeDasharray="4 6"
          style={{ animation: 'radarSpin 60s linear infinite', transformOrigin: '20% 30%' }} />
        <circle cx="70%" cy="70%" r="110" fill="none"
          stroke="rgba(139,92,246,0.06)" strokeWidth="0.6" strokeDasharray="3 8"
          style={{ animation: 'radarSpin 80s linear -10s infinite reverse', transformOrigin: '70% 70%' }} />
        <circle cx="50%" cy="20%" r="70" fill="none"
          stroke="rgba(52,211,153,0.06)" strokeWidth="0.6" strokeDasharray="2 5"
          style={{ animation: 'radarSpin 50s linear -20s infinite', transformOrigin: '50% 20%' }} />
      </svg>

      {/* Scanning line effect — more visible */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(59,130,246,0.06) 48%, rgba(139,92,246,0.04) 52%, transparent 58%, transparent 100%)',
        backgroundSize: '100% 200%',
        animation: 'scanLine 10s ease-in-out infinite',
      }} />

      {/* Vibrant floating gradient orbs */}
      <div className="glow-orb" style={{
        width: 450, height: 450, top: '2%', left: '5%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.25), rgba(59,130,246,0.05) 50%, transparent 70%)',
        animationDelay: '0s', animationDuration: '25s',
      }} />
      <div className="glow-orb" style={{
        width: 400, height: 400, top: '50%', right: '2%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2), rgba(139,92,246,0.05) 50%, transparent 70%)',
        animationDelay: '-8s', animationDuration: '30s',
      }} />
      <div className="glow-orb" style={{
        width: 350, height: 350, bottom: '5%', left: '20%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.15), rgba(52,211,153,0.03) 50%, transparent 70%)',
        animationDelay: '-15s', animationDuration: '28s',
      }} />
      <div className="glow-orb" style={{
        width: 300, height: 300, top: '20%', right: '25%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12), rgba(236,72,153,0.02) 50%, transparent 70%)',
        animationDelay: '-5s', animationDuration: '32s',
      }} />
      <div className="glow-orb" style={{
        width: 250, height: 250, top: '35%', left: '40%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%)',
        animationDelay: '-20s', animationDuration: '35s',
      }} />

      {/* Soft vignette — lighter */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(7,11,20,0.4) 100%)',
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
