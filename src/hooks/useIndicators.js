import { useState, useEffect, useCallback } from 'react'

const CG = 'https://api.coingecko.com/api/v3'

function sma(prices, period) {
  if (!prices || prices.length < period) return null
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period
}

function calcRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null
  const diffs = prices.slice(1).map((p, i) => p - prices[i])
  let avgGain = diffs.slice(0, period).filter(d => d > 0).reduce((a, b) => a + b, 0) / period
  let avgLoss = diffs.slice(0, period).filter(d => d < 0).reduce((a, b) => a + Math.abs(b), 0) / period
  for (let i = period; i < diffs.length; i++) {
    avgGain = (avgGain * (period - 1) + (diffs[i] > 0 ? diffs[i] : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (diffs[i] < 0 ? Math.abs(diffs[i]) : 0)) / period
  }
  return avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
}

function calcPiCycle(prices) {
  if (!prices || prices.length < 350) return null
  const ma111   = sma(prices, 111)
  const ma350x2 = sma(prices, 350) * 2
  return { ma111, ma350x2, gap: ((ma111 - ma350x2) / ma350x2) * 100 }
}

function estimateMVRV(prices, currentPrice) {
  if (!prices || prices.length < 200 || !currentPrice) return 2
  const slice   = prices.slice(-Math.min(365, prices.length))
  const yearLow  = Math.min(...slice)
  const yearHigh = Math.max(...slice)
  const range    = yearHigh - yearLow
  return range > 0 ? ((currentPrice - yearLow) / range) * 7 : 2
}

async function safeFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

const delay = ms => new Promise(r => setTimeout(r, ms))

export function useIndicators() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Fetch sequentially to avoid CoinGecko rate limits
    const btcPrice = await safeFetch(`${CG}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`)
    await delay(600)
    const globalData = await safeFetch(`${CG}/global`)
    await delay(600)
    const btcChart = await safeFetch(`${CG}/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily`)
    await delay(400)
    const fng = await safeFetch('https://api.alternative.me/fng/?limit=30')

    // We need at least a BTC price to show anything useful
    const currentPrice = btcPrice?.bitcoin?.usd ?? null
    if (!currentPrice) {
      setError('Could not load BTC price. CoinGecko may be rate-limiting — wait 60s and tap Retry.')
      setLoading(false)
      return
    }

    const change24h      = btcPrice?.bitcoin?.usd_24h_change ?? 0
    const marketCap      = btcPrice?.bitcoin?.usd_market_cap ?? 0
    const gd             = globalData?.data ?? {}
    const totalMarketCap = gd.total_market_cap?.usd ?? 0
    const btcDominance   = gd.market_cap_percentage?.btc ?? 50
    const ethDominance   = gd.market_cap_percentage?.eth ?? 15

    // Chart-derived calculations (graceful if chart failed)
    const rawPrices  = Array.isArray(btcChart?.prices) ? btcChart.prices.map(([, p]) => p) : []
    const prices     = rawPrices.length > 0 ? rawPrices : null
    const ma50       = sma(prices, 50)
    const ma200      = sma(prices, 200)
    const rsi        = calcRSI(prices)
    const piCycle    = calcPiCycle(prices)
    const mvrvEst    = estimateMVRV(prices, currentPrice)

    const altSeasonScore = Math.max(0, Math.min(100, (55 - btcDominance) * 4 + 50))

    // Composite cycle score
    const fngVal    = parseInt(fng?.data?.[0]?.value ?? 50)
    const rsiScore  = rsi  != null ? (rsi / 100) * 25 : 12.5
    const fngScore  = (fngVal / 100) * 25
    const mvrvScore = Math.min((mvrvEst / 8) * 25, 25)
    const piScore   = piCycle ? Math.max(0, Math.min(25, (1 - Math.abs(piCycle.gap) / 30) * 25)) : 5
    const cycleScore = Math.round(rsiScore + fngScore + mvrvScore + piScore)

    // F&G history
    const fngItems   = Array.isArray(fng?.data) ? fng.data : []
    const fngHistory = fngItems.slice(0, 30).reverse().map(d => ({
      value: parseInt(d.value),
      label: d.value_classification,
      date:  new Date(parseInt(d.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
    const currentFng = fngHistory.length > 0
      ? fngHistory[fngHistory.length - 1]
      : { value: fngVal, label: fngVal > 75 ? 'Extreme Greed' : fngVal > 55 ? 'Greed' : fngVal > 45 ? 'Neutral' : fngVal > 25 ? 'Fear' : 'Extreme Fear' }

    setData({
      currentPrice, change24h, marketCap, totalMarketCap,
      btcDominance, ethDominance,
      ma50, ma200, rsi, piCycle, mvrvEst,
      altSeasonScore, cycleScore,
      fngHistory, currentFng, prices,
      chartAvailable: prices !== null,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { data, loading, error, retry: fetchAll }
}
