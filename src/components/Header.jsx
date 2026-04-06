import React from 'react'
import { RefreshCw, Wifi, WifiOff, Clock, Sparkles } from 'lucide-react'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  portfolio: 'Portfolio',
  markets: 'Markets',
  charts: 'Charts',
  watchlist: 'Watchlist',
  indicators: 'Indicators',
  news: 'News',
}

export default function Header({ page, lastUpdated, loading, error, onRefresh }) {
  const fmt = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b shrink-0 glass relative overflow-hidden"
      style={{ borderColor: 'var(--border)' }}>

      {/* Animated gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(139,92,246,0.4), rgba(236,72,153,0.2), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }} />

      <div>
        {/* Logo visible only on mobile (sidebar hidden) */}
        <div className="flex items-center gap-2 md:hidden mb-0.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>CD</span>
          </div>
          <span className="text-xs font-bold gradient-text">CryptoDesk</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-semibold text-white">{PAGE_TITLES[page]}</h1>
          <Sparkles size={14} style={{ color: '#8b5cf6', opacity: 0.6, animation: 'float 3s ease-in-out infinite' }} />
        </div>
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
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full relative"
          style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: '#10b981', animationDuration: '2s' }} />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="hidden md:inline font-medium">Live</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
          style={{ background: 'rgba(19,29,53,0.6)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>
    </header>
  )
}
