import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { fmt$, fmtPct } from './StatCard'

const COIN_COLORS = {
  bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff', chainlink: '#2a5ada',
  cardano: '#0d1e7e', 'avalanche-2': '#e84142', polkadot: '#e6007a', uniswap: '#ff007a',
  dogecoin: '#c2a633', ripple: '#346aa9', sui: '#4da2ff', aptos: '#00c2a0',
  arbitrum: '#12aaff', optimism: '#ff0420', near: '#00c08b',
}

function MiniBar({ value, max }) {
  const pct = max ? Math.min(Math.abs(value) / max * 100, 100) : 0
  const isUp = value >= 0
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isUp ? 'var(--green)' : 'var(--red)' }} />
      </div>
    </div>
  )
}

export default function MarketOverview({ watchlist, details, prices }) {
  const items = watchlist
    .map(id => {
      const d = details[id]
      const p = prices[id]
      if (!d && !p) return null
      return {
        id,
        name: d?.name || id,
        symbol: (d?.symbol || id).toUpperCase(),
        price: p?.usd ?? d?.current_price,
        change24h: p?.usd_24h_change ?? d?.price_change_percentage_24h,
        marketCap: p?.usd_market_cap ?? d?.market_cap,
        volume: p?.usd_24h_vol ?? d?.total_volume,
        image: d?.image,
      }
    })
    .filter(Boolean)

  const maxAbsChange = Math.max(...items.map(i => Math.abs(i.change24h ?? 0)), 1)

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-white">Market Overview</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{items.length} coins tracked</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Coin', 'Price', '24h Change', 'Market Cap', 'Volume 24h'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className="card-hover"
                style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(30,45,74,0.4)' : 'none' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.image
                      ? <img src={item.image} alt={item.symbol} className="w-7 h-7 rounded-full" />
                      : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: COIN_COLORS[item.id] || '#64748b' }}>
                          {item.symbol.slice(0, 2)}
                        </div>
                    }
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 number-font font-medium text-white whitespace-nowrap">
                  {item.price ? fmt$(item.price, item.price > 100 ? 2 : 4) : '—'}
                </td>
                <td className="px-4 py-3">
                  {item.change24h !== null && item.change24h !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-medium ${item.change24h >= 0 ? 'positive' : 'negative'}`}>
                        {item.change24h >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {fmtPct(item.change24h)}
                      </span>
                      <MiniBar value={item.change24h} max={maxAbsChange} />
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {item.marketCap ? fmt$(item.marketCap) : '—'}
                </td>
                <td className="px-4 py-3 number-font whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {item.volume ? fmt$(item.volume) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
