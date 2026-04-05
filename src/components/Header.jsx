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
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      <div>
        {/* Logo visible only on mobile (sidebar hidden) */}
        <div className="flex items-center gap-2 md:hidden mb-0.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>CD</span>
          </div>
          <span className="text-xs font-bold text-white">CryptoDesk</span>
        </div>
        <h1 className="text-base md:text-lg font-semibold text-white">{PAGE_TITLES[page]}</h1>
        <div className="hidden md:flex items-center gap-1.5 mt-0.5">
          {error ? (
            <><WifiOff size={11} style={{ color: 'var(--red)' }} />
              <span className="text-xs" style={{ color: 'var(--red)' }}>Offline</span></>
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

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow inline-block"></span>
          <span className="hidden md:inline">Live</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>
    </header>
  )
}
