import React from 'react'
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  portfolio: 'Portfolio',
  markets: 'Markets',
  charts: 'Charts',
  watchlist: 'Watchlist',
}

export default function Header({ page, lastUpdated, loading, error, onRefresh }) {
  const fmt = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      <div>
        <h1 className="text-lg font-semibold text-white">{PAGE_TITLES[page]}</h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          {error ? (
            <><WifiOff size={11} style={{ color: 'var(--red)' }} />
              <span className="text-xs" style={{ color: 'var(--red)' }}>Offline — using cached data</span></>
          ) : (
            <><Wifi size={11} className="positive" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live via CoinGecko</span></>
          )}
          {fmt && (
            <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
              <Clock size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Updated {fmt}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow inline-block"></span>
          Live
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </header>
  )
}
