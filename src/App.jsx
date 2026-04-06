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
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Floating gradient orbs */}
      <div className="glow-orb" style={{
        width: 400, height: 400, top: '10%', left: '5%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)',
        animationDelay: '0s', animationDuration: '25s',
      }} />
      <div className="glow-orb" style={{
        width: 350, height: 350, top: '60%', right: '10%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
        animationDelay: '-8s', animationDuration: '30s',
      }} />
      <div className="glow-orb" style={{
        width: 300, height: 300, bottom: '10%', left: '30%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)',
        animationDelay: '-15s', animationDuration: '22s',
      }} />
      <div className="glow-orb" style={{
        width: 250, height: 250, top: '30%', right: '30%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)',
        animationDelay: '-5s', animationDuration: '28s',
      }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridPulse 8s ease-in-out infinite',
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
