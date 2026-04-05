import { useState, useEffect } from 'react'

const COINGECKO = 'https://api.coingecko.com/api/v3'

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
    const gain = diffs[i] > 0 ? diffs[i] : 0
    const loss = diffs[i] < 0 ? Math.abs(diffs[i]) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }
  if (avgLoss === 0) return 100
  return 100 - (100 / (1 + avgGain / avgLoss))
}

function calcPiCycle(prices) {
  if (!prices || prices.length < 350) return null
  const ma111 = sma(prices, 111)
  const ma350x2 = sma(prices, 350) * 2
  const gap = ((ma111 - ma350x2) / ma350x2) * 100
  return { ma111, ma350x2, gap }
}

function estimateMVRV(prices, currentPrice) {
  if (!prices || prices.length < 365 || !currentPrice) return 2
  const yearLow  = Math.min(...prices.slice(-365))
  const yearHigh = Math.max(...prices.slice(-365))
  const range = yearHigh - yearLow
  const position = range > 0 ? (currentPrice - yearLow) / range : 0
  return position * 7
}

export function useIndicators() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [fngRes, globalRes, btcChartRes, btcPriceRes] = await Promise.all([
          fetch('https://api.alternative.me/fng/?limit=30'),
          fetch(`${COINGECKO}/global`),
          fetch(`${COINGECKO}/coins/bitcoin/market_chart?vs_currency=usd&days=400&interval=daily`),
          fetch(`${COINGECKO}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`),
        ])

        const [fng, global, btcChart, btcPrice] = await Promise.all([
          fngRes.json(), globalRes.json(), btcChartRes.json(), btcPriceRes.json(),
        ])

        // Guard against malformed API responses
        const rawPrices = btcChart?.prices
        if (!Array.isArray(rawPrices) || rawPrices.length === 0) {
          throw new Error('BTC price data unavailable — CoinGecko rate limit hit. Try again in 60s.')
        }

        const prices       = rawPrices.map(([, p]) => p)
        const currentPrice = btcPrice?.bitcoin?.usd ?? prices[prices.length - 1]
        const change24h    = btcPrice?.bitcoin?.usd_24h_change ?? 0
        const marketCap    = btcPrice?.bitcoin?.usd_market_cap ?? 0
        const globalData   = global?.data ?? {}
        const totalMarketCap  = globalData.total_market_cap?.usd ?? 0
        const btcDominance    = globalData.market_cap_percentage?.btc ?? 50
        const ethDominance    = globalData.market_cap_percentage?.eth ?? 15

        const ma50   = sma(prices, 50)
        const ma200  = sma(prices, 200)
        const ma111  = sma(prices, 111)
        const ma350  = sma(prices, 350)
        const rsi    = calcRSI(prices)
        const piCycle = calcPiCycle(prices)
        const mvrvEst = estimateMVRV(prices, currentPrice)

        // Alt season proxy: low BTC dominance = alt season
        const altSeasonScore = Math.max(0, Math.min(100, (55 - btcDominance) * 4 + 50))

        // Composite cycle score (0–100): higher = closer to top
        const rsiScore  = rsi != null ? (rsi / 100) * 25 : 12.5
        const fngVal    = parseInt(fng?.data?.[0]?.value ?? 50)
        const fngScore  = (fngVal / 100) * 25
        const mvrvScore = Math.min((mvrvEst / 8) * 25, 25)
        const piScore   = piCycle ? Math.max(0, Math.min(25, (1 - Math.abs(piCycle.gap) / 30) * 25)) : 5
        const cycleScore = Math.round(rsiScore + fngScore + mvrvScore + piScore)

        // Fear & Greed history
        const fngItems = Array.isArray(fng?.data) ? fng.data : []
        const fngHistory = fngItems.slice(0, 30).reverse().map(d => ({
          value: parseInt(d.value),
          label: d.value_classification,
          date:  new Date(parseInt(d.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }))
        const currentFng = fngHistory.length > 0 ? fngHistory[fngHistory.length - 1] : { value: fngVal, label: 'Unknown' }

        setData({
          currentPrice, change24h, marketCap, totalMarketCap,
          btcDominance, ethDominance,
          ma50, ma200, ma111, ma350,
          rsi, piCycle, mvrvEst, altSeasonScore, cycleScore,
          fngHistory, currentFng, prices,
        })
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return { data, loading, error }
}
