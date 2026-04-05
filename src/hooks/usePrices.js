import { useState, useEffect, useRef, useCallback } from 'react'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const REFRESH_INTERVAL = 30000 // 30s

export function usePrices(coinIds) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const isMounted = useRef(true)

  const fetchPrices = useCallback(async () => {
    if (!coinIds || coinIds.length === 0) return
    try {
      const ids = coinIds.join(',')
      const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (isMounted.current) {
        setPrices(data)
        setLastUpdated(new Date())
        setLoading(false)
        setError(null)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message)
        setLoading(false)
      }
    }
  }, [coinIds?.join(',')])

  useEffect(() => {
    isMounted.current = true
    fetchPrices()
    timerRef.current = setInterval(fetchPrices, REFRESH_INTERVAL)
    return () => {
      isMounted.current = false
      clearInterval(timerRef.current)
    }
  }, [fetchPrices])

  return { prices, loading, lastUpdated, error, refresh: fetchPrices }
}

export function useSparkline(coinId, days = 7) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coinId) return
    setLoading(true)
    fetch(`${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`)
      .then(r => r.json())
      .then(d => {
        if (d.prices) {
          setData(d.prices.map(([ts, price]) => ({ ts, price })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [coinId, days])

  return { data, loading }
}

export function useCoinDetails(coinIds) {
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coinIds || coinIds.length === 0) return
    const ids = coinIds.join(',')
    fetch(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`)
      .then(r => r.json())
      .then(d => {
        const map = {}
        d.forEach(coin => { map[coin.id] = coin })
        setDetails(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [coinIds?.join(',')])

  return { details, loading }
}
