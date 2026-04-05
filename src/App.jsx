import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ChartsPage from './components/ChartsPage'
import WatchlistPage from './components/WatchlistPage'
import MarketOverview from './components/MarketOverview'
import PositionsTable from './components/PositionsTable'
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext'
import { usePrices, useCoinDetails } from './hooks/usePrices'

function AppInner() {
  const [page, setPage] = useState('dashboard')
  const { positions, watchlist, removePosition } = usePortfolio()

  const allIds = [...new Set([...positions.map(p => p.id), ...watchlist])]
  const positionIds = positions.map(p => p.id)

  const { prices, loading: pricesLoading, lastUpdated, error, refresh } = usePrices(allIds)
  const { details, loading: detailsLoading } = useCoinDetails(allIds)

  const loading = pricesLoading || detailsLoading

  // Total value for portfolio page
  const totalValue = positions.reduce((sum, pos) => {
    const p = prices[pos.id]
    const d = details[pos.id]
    const price = p?.usd ?? d?.current_price ?? 0
    return sum + price * pos.amount
  }, 0)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar active={page} onNav={setPage} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header page={page} lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refresh} />

        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
          {page === 'dashboard' && (
            <Dashboard prices={prices} details={details} loading={loading} />
          )}
          {page === 'portfolio' && (
            <div className="p-6">
              <PositionsTable
                positions={positions}
                prices={prices}
                details={details}
                totalValue={totalValue}
                onRemove={removePosition}
              />
            </div>
          )}
          {page === 'markets' && (
            <div className="p-6">
              <MarketOverview watchlist={watchlist} details={details} prices={prices} />
            </div>
          )}
          {page === 'charts' && (
            <ChartsPage prices={prices} details={details} />
          )}
          {page === 'watchlist' && (
            <WatchlistPage watchlist={watchlist} details={details} prices={prices} />
          )}
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
