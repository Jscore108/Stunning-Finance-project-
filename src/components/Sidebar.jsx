import React from 'react'
import {
  LayoutDashboard, TrendingUp, Wallet, BarChart2,
  Star, Settings, Bell, ChevronRight, Activity, Newspaper, Gauge
} from 'lucide-react'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'portfolio',   label: 'Portfolio',    icon: Wallet },
  { id: 'indicators',  label: 'Indicators',   icon: Gauge },
  { id: 'markets',     label: 'Markets',      icon: TrendingUp },
  { id: 'charts',      label: 'Charts',       icon: BarChart2 },
  { id: 'watchlist',   label: 'Watchlist',    icon: Star },
  { id: 'news',        label: 'News',         icon: Newspaper },
]

export default function Sidebar({ active, onNav }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r shrink-0 glass relative overflow-hidden"
        style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
        {/* Sidebar gradient accent */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, transparent 30%, transparent 70%, rgba(139,92,246,0.04) 100%)',
        }} />
        {/* Right edge glow line */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px]" style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.3), rgba(139,92,246,0.2), rgba(236,72,153,0.1), transparent)',
        }} />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b relative z-10" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-blue"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b)' }}>
              <Activity size={17} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />
            </div>
            <div className="absolute inset-0 rounded-xl breathing-ring"
              style={{ border: '2px solid rgba(59,130,246,0.4)' }} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide gradient-text">CryptoDesk</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Personal Finance</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onNav(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive ? 'nav-active-glow' : ''}`}
                style={{
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                }}
              >
                {/* Hover gradient overlay */}
                {!isActive && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))' }} />
                )}
                {/* Active left accent */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
                )}
                <Icon size={16} className="shrink-0 relative z-10" style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' } : {}} />
                <span className="flex-1 text-left relative z-10">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" style={{ animation: 'slideInRight 0.3s ease' }} />}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-white/5 group"
            style={{ color: 'var(--text-secondary)' }}>
            <Bell size={16} />
            <span>Alerts</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full badge-green relative">
              3
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(16,185,129,0.3)', animationDuration: '2s' }} />
            </span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}>
            <Settings size={16} className="group-hover:animate-spin" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t glass"
        style={{ borderColor: 'var(--border)', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 relative"
              style={{
                color: isActive ? '#60a5fa' : 'var(--text-muted)',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                minWidth: 52,
              }}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
              )}
              <Icon size={20} style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' } : {}} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
