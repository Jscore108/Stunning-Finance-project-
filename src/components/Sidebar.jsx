import React from 'react'
import {
  LayoutDashboard, TrendingUp, Wallet, BarChart2,
  Star, Settings, Bell, ChevronRight, Activity, Newspaper
} from 'lucide-react'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'portfolio',  label: 'Portfolio',    icon: Wallet },
  { id: 'markets',    label: 'Markets',      icon: TrendingUp },
  { id: 'charts',     label: 'Charts',       icon: BarChart2 },
  { id: 'watchlist',  label: 'Watchlist',    icon: Star },
  { id: 'news',       label: 'News',         icon: Newspaper },
]

export default function Sidebar({ active, onNav }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-blue"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">CryptoDesk</div>
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <Bell size={16} />
            <span>Alerts</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full badge-green">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: isActive ? '#60a5fa' : 'var(--text-muted)',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                minWidth: 52,
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
