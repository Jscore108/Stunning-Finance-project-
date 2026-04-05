import React from 'react'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { fmt$, fmtPct } from './StatCard'

const COIN_COLORS = {
  bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff', chainlink: '#2a5ada',
  cardano: '#0d1e7e', 'avalanche-2': '#e84142', polkadot: '#e6007a', uniswap: '#ff007a',
  dogecoin: '#c2a633', ripple: '#346aa9', sui: '#4da2ff', aptos: '#00c2a0',
  arbitrum: '#12aaff', optimism: '#ff0420', near: '#00c08b',
}

export default function TopMovers({ details, prices }) {
  const items = Object.entries(details).map(([id, d]) => ({
    id,
    name: d.name,
    symbol: d.symbol?.toUpperCase(),
    price: prices[id]?.usd ?? d.current_price,
    change: prices[id]?.usd_24h_change ?? d.price_change_percentage_24h,
    image: d.image,
  })).filter(i => i.change !== null && i.change !== undefined)

  const gainers = [...items].sort((a, b) => b.change - a.change).slice(0, 4)
  const losers  = [...items].sort((a, b) => a.change - b.change).slice(0, 4)

  function CoinRow({ item, isGainer }) {
    const color = COIN_COLORS[item.id] || '#64748b'
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          {item.image
            ? <img src={item.image} alt={item.symbol} className="w-6 h-6 rounded-full" />
            : <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: color, fontSize: 8 }}>
                {item.symbol?.slice(0, 2)}
              </div>
          }
          <div>
            <div className="text-xs font-medium text-white">{item.symbol}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.price ? fmt$(item.price, item.price > 100 ? 2 : 4) : '—'}</div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isGainer ? 'badge-green' : 'badge-red'}`}>
          {fmtPct(item.change)}
        </span>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={15} style={{ color: '#f59e0b' }} />
        <h2 className="font-semibold text-white">Top Movers (24h)</h2>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium positive">
            <TrendingUp size={12} /> Gainers
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(30,45,74,0.4)' }}>
            {gainers.map(i => <CoinRow key={i.id} item={i} isGainer />)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium negative">
            <TrendingDown size={12} /> Losers
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(30,45,74,0.4)' }}>
            {losers.map(i => <CoinRow key={i.id} item={i} isGainer={false} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
