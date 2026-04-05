import { useState, useEffect, useRef } from 'react'

const FEEDS = {
  all:      'https://cointelegraph.com/rss',
  bitcoin:  'https://cointelegraph.com/rss/tag/bitcoin',
  ethereum: 'https://cointelegraph.com/rss/tag/ethereum',
  solana:   'https://cointelegraph.com/rss/tag/solana',
  altcoins: 'https://cointelegraph.com/rss/tag/altcoin',
  markets:  'https://cointelegraph.com/rss/category/market-analysis',
  defi:     'https://cointelegraph.com/rss/tag/defi',
}

function parseRSS(xmlText) {
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlText, 'text/xml')
  const items = Array.from(xml.querySelectorAll('item'))
  return items.slice(0, 24).map(item => {
    const get = tag => item.querySelector(tag)?.textContent?.trim() || ''
    // Try multiple image sources
    const enclosure = item.querySelector('enclosure')?.getAttribute('url')
    const mediaThumbnail = item.querySelector('thumbnail')?.getAttribute('url')
      || item.querySelector('[url]')?.getAttribute('url')
    const imgMatch = get('description').match(/src="([^"]+\.(jpg|jpeg|png|webp))/i)
    const thumbnail = enclosure || mediaThumbnail || imgMatch?.[1] || ''
    const description = get('description').replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
    return {
      id: get('guid') || get('link'),
      title: get('title'),
      link: get('link'),
      description,
      thumbnail,
      pubDate: get('pubDate'),
    }
  })
}

export function useNews(category = 'all') {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    setLoading(true)
    setArticles([])
    setError(null)

    const feed = FEEDS[category] || FEEDS.all
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feed)}`

    fetch(proxy)
      .then(r => r.json())
      .then(data => {
        if (!isMounted.current) return
        if (!data.contents) throw new Error('Empty response')
        const parsed = parseRSS(data.contents)
        if (parsed.length === 0) throw new Error('No articles found')
        setArticles(parsed)
        setLoading(false)
      })
      .catch(err => {
        if (!isMounted.current) return
        // Fallback: try corsproxy.io
        fetch(`https://corsproxy.io/?${encodeURIComponent(feed)}`)
          .then(r => r.text())
          .then(xml => {
            const parsed = parseRSS(xml)
            setArticles(parsed)
            setLoading(false)
          })
          .catch(() => {
            setError('Unable to load news. Try again later.')
            setLoading(false)
          })
      })

    return () => { isMounted.current = false }
  }, [category])

  return { articles, loading, error }
}
