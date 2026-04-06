import React, { useState } from 'react'
import { Star, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { fmt$, fmtPct } from './StatCard'

const COIN_COLORS = {
  bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff', chainlink: '#2a5ada',
  cardano: '#0d1e7e', 'avalanche-2': '#e84142', polkadot: '#e6007a', uniswap: '#ff007a',
  dogecoin: '#c2a633', ripple: '#346aa9', sui: '#4da2ff', aptos: '#00c2a0',
  arbitrum: '#12aaff', optimism: '#ff0420', near: '#00c08b',
}

function Sparkline({ prices, isUp }) {
  if (!prices || prices.length < 2) return <div className="w-20 h-8" />
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 80, h = 32, pad = 2
  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (p - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const color = isUp ? '#10b981' : '#ef4444'
  const gradId = `spark-${isUp ? 'up' : 'down'}-${Math.random().toString(36).slice(2, 6)}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${w - pad},${h - pad} ${pad},${h - pad}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function WatchlistPage({ watchlist, details, prices }) {
  const [search, setSearch] = useState('')

  const items = watchlist
    .map(id => {
      const d = details[id]
      const p = prices[id]
      if (!d && !p) return null
      const price = p?.usd ?? d?.current_price
      const change24h = p?.usd_24h_change ?? d?.price_change_percentage_24h
      const sparkPrices = d?.sparkline_in_7d?.price
      const isUp = sparkPrices?.length >= 2
        ? sparkPrices[sparkPrices.length - 1] >= sparkPrices[0]
        : (change24h ?? 0) >= 0
      return {
        id, price, change24h, isUp,
        name: d?.name || id,
        symbol: (d?.symbol || id).toUpperCase(),
        marketCap: p?.usd_market_cap ?? d?.market_cap,
        volume: p?.usd_24h_vol ?? d?.total_volume,
        change7d: d?.price_change_percentage_7d_in_currency,
        change1h: d?.price_change_percentage_1h_in_currency,
        sparkPrices,
        image: d?.image,
        rank: d?.market_cap_rank,
      }
    })
    .filter(Boolean)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.symbol.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-4 p-3 md:p-6">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <Star size={14} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }} />
            </div>
            <h2 className="font-semibold text-white">Watchlist</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
              {items.length}
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-sm pl-8 pr-3 py-1.5 rounded-xl outline-none transition-all duration-300 focus:ring-1 focus:ring-blue-500/30"
              style={{ background: 'rgba(19,29,53,0.6)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: 180 }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Coin', 'Price', '1h', '24h', '7d', 'Market Cap', 'Volume 24h', '7d Chart'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="card-hover transition-all duration-300 group"
                  style={{
                    borderBottom: i < items.length - 1 ? '1px solid rgba(30,45,74,0.4)' : 'none',
                    animation: `fadeSlideUp 0.4s ease ${i * 0.04}s both`,
                  }}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{item.rank ?? i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image
                        ? <img src={item.image} alt={item.symbol} className="w-7 h-7 rounded-full ring-2 ring-white/5 transition-transform duration-300 group-hover:scale-110" />
                        : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: COIN_COLORS[item.id] || '#64748b', fontSize: 9 }}>
                            {item.symbol.slice(0, 2)}
                          </div>
                      }
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-300 transition-colors">{item.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 number-font font-medium text-white whitespace-nowrap">
                    {item.price ? fmt$(item.price, item.price > 100 ? 2 : 4) : '—'}
                  </td>
                  {[item.change1h, item.change24h, item.change7d].map((ch, ci) => (
                    <td key={ci} className="px-4 py-3 whitespace-nowrap">
                      {ch !== null && ch !== undefined ? (
                        <span className={`text-xs font-medium flex items-center gap-1 ${ch >= 0 ? 'positive' : 'negative'}`}>
                          {ch >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {fmtPct(ch)}
                        </span>
                      ) : '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {item.marketCap ? fmt$(item.marketCap) : '—'}
                  </td>
                  <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {item.volume ? fmt$(item.volume) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Sparkline prices={item.sparkPrices} isUp={item.isUp} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
