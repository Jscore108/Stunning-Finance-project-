import React, { useState } from 'react'
import { ExternalLink, Clock, RefreshCw, Newspaper } from 'lucide-react'
import { useNews } from '../hooks/useNews'

const CATEGORIES = [
  { id: 'all',     label: 'All News' },
  { id: 'BTC',     label: 'Bitcoin' },
  { id: 'ETH',     label: 'Ethereum' },
  { id: 'SOL',     label: 'Solana' },
  { id: 'LINK',    label: 'Chainlink' },
  { id: 'market',  label: 'Markets' },
  { id: 'trading', label: 'Trading' },
]

function timeAgo(timestamp) {
  const diff = Date.now() / 1000 - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function ArticleCard({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover flex flex-col gap-3 p-4 group"
      style={{ textDecoration: 'none' }}
    >
      {/* Image */}
      {article.imageurl && (
        <div className="w-full rounded-lg overflow-hidden" style={{ height: 160 }}>
          <img
            src={article.imageurl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      {/* Categories */}
      {article.categories && (
        <div className="flex flex-wrap gap-1">
          {article.categories.split('|').slice(0, 3).map(cat => (
            <span key={cat} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
              {cat.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
        {article.title}
      </h3>

      {/* Body preview */}
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
        {article.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          {article.source_info?.img && (
            <img src={article.source_info.img} alt={article.source}
              className="w-4 h-4 rounded-full object-contain"
              onError={e => { e.target.style.display = 'none' }} />
          )}
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {article.source_info?.name || article.source}
          </span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Clock size={10} />
          <span className="text-xs">{timeAgo(article.published_on)}</span>
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 flex flex-col gap-3 animate-pulse-slow">
      <div className="w-full rounded-lg" style={{ height: 160, background: 'var(--bg-card-hover)' }} />
      <div className="h-3 w-1/3 rounded" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-full rounded" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-3/4 rounded" style={{ background: 'var(--border)' }} />
      <div className="h-3 w-full rounded" style={{ background: 'var(--border)' }} />
      <div className="h-3 w-2/3 rounded" style={{ background: 'var(--border)' }} />
    </div>
  )
}

export default function NewsPage() {
  const [category, setCategory] = useState('all')
  const { articles, loading, error } = useNews(category)

  return (
    <div className="flex flex-col gap-4 p-3 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={18} style={{ color: '#60a5fa' }} />
          <div>
            <h2 className="font-semibold text-white">Crypto News</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Live from CryptoCompare</p>
          </div>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background: category === cat.id ? 'rgba(59,130,246,0.2)' : 'var(--bg-card)',
              color: category === cat.id ? '#60a5fa' : 'var(--text-secondary)',
              border: category === cat.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 text-center text-sm" style={{ color: 'var(--red)' }}>
          Failed to load news. Check your connection and try again.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map(article => <ArticleCard key={article.id} article={article} />)
        }
      </div>

      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
          No articles found for this category.
        </div>
      )}
    </div>
  )
}
