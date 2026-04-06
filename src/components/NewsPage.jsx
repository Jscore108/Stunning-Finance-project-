import React, { useState } from 'react'
import { ExternalLink, Clock, RefreshCw, Newspaper, Globe, ArrowUpRight } from 'lucide-react'
import { useNews } from '../hooks/useNews'

const CATEGORIES = [
  { id: 'all',      label: 'All News' },
  { id: 'bitcoin',  label: 'Bitcoin' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'solana',   label: 'Solana' },
  { id: 'altcoins', label: 'Altcoins' },
  { id: 'markets',  label: 'Markets' },
  { id: 'defi',     label: 'DeFi' },
]

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || ''
}

function ArticleCard({ article, index }) {
  const description = stripHtml(article.description)

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover flex flex-col gap-3 p-4 group"
      style={{ textDecoration: 'none', animation: `fadeSlideUp 0.5s ease ${index * 0.06}s both` }}
    >
      {/* Image */}
      {article.thumbnail && (
        <div className="w-full rounded-xl overflow-hidden relative" style={{ height: 160 }}>
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Floating link icon */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            style={{ background: 'rgba(59,130,246,0.9)', backdropFilter: 'blur(8px)' }}>
            <ArrowUpRight size={14} className="text-white" />
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
        {article.title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1.5">
          <Globe size={10} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            CoinTelegraph
          </span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Clock size={10} />
          <span className="text-xs">{timeAgo(article.pubDate)}</span>
        </div>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="w-full rounded-xl shimmer" style={{ height: 160, background: 'var(--bg-card-hover)' }} />
      <div className="h-3 w-1/3 rounded shimmer" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-full rounded shimmer" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-3/4 rounded shimmer" style={{ background: 'var(--border)' }} />
      <div className="h-3 w-full rounded shimmer" style={{ background: 'var(--border)' }} />
      <div className="h-3 w-2/3 rounded shimmer" style={{ background: 'var(--border)' }} />
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.12)' }}>
            <Newspaper size={18} style={{ color: '#60a5fa', filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.5))' }} />
          </div>
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
            className="text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 shrink-0 active:scale-95"
            style={{
              background: category === cat.id ? 'rgba(59,130,246,0.2)' : 'rgba(19,29,53,0.6)',
              color: category === cat.id ? '#60a5fa' : 'var(--text-secondary)',
              border: category === cat.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
              boxShadow: category === cat.id ? '0 0 12px rgba(59,130,246,0.15)' : 'none',
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
          : articles.map((article, i) => <ArticleCard key={article.id} article={article} index={i} />)
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
