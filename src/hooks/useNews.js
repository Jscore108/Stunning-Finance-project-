import { useState, useEffect, useRef } from 'react'

const CATEGORIES = ['all', 'BTC', 'ETH', 'SOL', 'LINK', 'ADA', 'market', 'trading']

export function useNews(category = 'all') {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    setLoading(true)

    const params = category === 'all'
      ? '?lang=EN&sortOrder=latest'
      : `?lang=EN&categories=${category}&sortOrder=latest`

    fetch(`https://min-api.cryptocompare.com/data/v2/news/${params}`)
      .then(r => r.json())
      .then(data => {
        if (isMounted.current && data.Data) {
          setArticles(data.Data.slice(0, 30))
          setError(null)
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
