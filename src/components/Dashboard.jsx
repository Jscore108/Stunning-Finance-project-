import React, { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'
import StatCard, { fmt$, fmtPct } from './StatCard'
import PortfolioChart from './PortfolioChart'
import AllocationChart from './AllocationChart'
import TopMovers from './TopMovers'
import PositionsTable from './PositionsTable'
import { usePortfolio } from '../context/PortfolioContext'

export default function Dashboard({ prices, details, loading }) {
  const { positions, removePosition } = usePortfolio()

  const stats = useMemo(() => {
    let totalValue = 0
    let totalCost = 0
    let bestPnl = { val: -Infinity, sym: '' }
    let worstPnl = { val: Infinity, sym: '' }

    positions.forEach(pos => {
      const p = prices[pos.id]
      const d = details[pos.id]
      const currentPrice = p?.usd ?? d?.current_price ?? 0
      const value = currentPrice * pos.amount
      const cost = pos.avgBuyPrice * pos.amount
      totalValue += value
      totalCost += cost
      const pnlPct = cost ? ((value - cost) / cost) * 100 : 0
      if (pnlPct > bestPnl.val) bestPnl = { val: pnlPct, sym: pos.symbol }
      if (pnlPct < worstPnl.val) worstPnl = { val: pnlPct, sym: pos.symbol }
    })

    const totalPnl = totalValue - totalCost
    const totalPnlPct = totalCost ? (totalPnl / totalCost) * 100 : 0

    // Weighted 24h portfolio change
    const portfolioChange24h = positions.reduce((acc, pos) => {
      const p = prices[pos.id]
      const d = details[pos.id]
      const price = p?.usd ?? d?.current_price ?? 0
      const value = price * pos.amount
      const change = p?.usd_24h_change ?? d?.price_change_percentage_24h ?? 0
      return acc + (totalValue ? (value / totalValue) * change : 0)
    }, 0)

    return { totalValue, totalCost, totalPnl, totalPnlPct, portfolioChange24h, bestPnl, worstPnl }
  }, [positions, prices, details])

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Portfolio Value"
          value={loading && !stats.totalValue ? '—' : fmt$(stats.totalValue)}
          subValue={`Cost basis: ${fmt$(stats.totalCost)}`}
          change={stats.portfolioChange24h}
          icon={Wallet}
        />
        <StatCard
          label="Total P&L"
          value={(stats.totalPnl >= 0 ? '+' : '') + fmt$(stats.totalPnl)}
          subValue={fmtPct(stats.totalPnlPct) + ' all time'}
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard
          label="Best Performer"
          value={stats.bestPnl.sym || '—'}
          subValue={stats.bestPnl.val !== -Infinity ? fmtPct(stats.bestPnl.val) + ' ROI' : ''}
          icon={TrendingUp}
        />
        <StatCard
          label="Worst Performer"
          value={stats.worstPnl.sym || '—'}
          subValue={stats.worstPnl.val !== Infinity ? fmtPct(stats.worstPnl.val) + ' ROI' : ''}
          icon={TrendingDown}
        />
      </div>

      {/* Portfolio chart + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PortfolioChart totalValue={stats.totalValue} />
        </div>
        <AllocationChart positions={positions} prices={prices} details={details} />
      </div>

      {/* Top Movers */}
      {Object.keys(details).length > 0 && (
        <TopMovers details={details} prices={prices} />
      )}

      {/* Positions Table */}
      <PositionsTable
        positions={positions}
        prices={prices}
        details={details}
        totalValue={stats.totalValue}
        onRemove={removePosition}
      />
    </div>
  )
}
