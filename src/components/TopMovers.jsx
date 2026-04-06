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

  function CoinRow({ item, isGainer, index }) {
    const color = COIN_COLORS[item.id] || '#64748b'
    return (
      <div
        className="flex items-center justify-between py-2.5 px-2 rounded-xl transition-all duration-300 hover:bg-white/5 group"
        style={{ animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both` }}
      >
        <div className="flex items-center gap-2.5">
          {item.image
            ? <img src={item.image} alt={item.symbol} className="w-7 h-7 rounded-full ring-2 ring-white/5 transition-transform duration-300 group-hover:scale-110" />
            : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white/5"
                style={{ background: color, fontSize: 9 }}>
                {item.symbol?.slice(0, 2)}
              </div>
          }
          <div>
            <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">{item.symbol}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.price ? fmt$(item.price, item.price > 100 ? 2 : 4) : '—'}</div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-300 group-hover:scale-105 ${isGainer ? 'badge-green' : 'badge-red'}`}>
          {fmtPct(item.change)}
        </span>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Zap size={14} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }} />
        </div>
        <h2 className="font-semibold text-white">Top Movers (24h)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold positive px-2">
            <TrendingUp size={12} /> Gainers
          </div>
          <div className="space-y-0.5">
            {gainers.map((i, idx) => <CoinRow key={i.id} item={i} isGainer index={idx} />)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold negative px-2">
            <TrendingDown size={12} /> Losers
          </div>
          <div className="space-y-0.5">
            {losers.map((i, idx) => <CoinRow key={i.id} item={i} isGainer={false} index={idx} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
