import { useState, useEffect, useRef } from 'react'

// Free RSS feeds via rss2json (no API key needed for public feeds)
const FEEDS = {
  all:        'https://cointelegraph.com/rss',
  bitcoin:    'https://cointelegraph.com/rss/tag/bitcoin',
  ethereum:   'https://cointelegraph.com/rss/tag/ethereum',
  solana:     'https://cointelegraph.com/rss/tag/solana',
  altcoins:   'https://cointelegraph.com/rss/tag/altcoin',
  markets:    'https://cointelegraph.com/rss/category/market-analysis',
  defi:       'https://cointelegraph.com/rss/tag/defi',
}

const RSS2JSON = 'https://api.rss2json.com/v1/api.json'

export function useNews(category = 'all') {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    setLoading(true)
    setArticles([])

    const feed = FEEDS[category] || FEEDS.all
    const url = `${RSS2JSON}?rss_url=${encodeURIComponent(feed)}&count=24`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!isMounted.current) return
        if (data.status === 'ok' && data.items) {
          setArticles(data.items)
          setError(null)
        } else {
          setError('Failed to load feed')
        }
        setLoading(false)
      })
      .catch(err => {
        if (isMounted.current) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { isMounted.current = false }
  }, [category])

  return { articles, loading, error }
}
