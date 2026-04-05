import { useState, useEffect } from 'react'

const COINGECKO = 'https://api.coingecko.com/api/v3'

// Simple moving average
function sma(prices, period) {
  if (prices.length < period) return null
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period
}

// RSI (14-period)
function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return null
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

// Pi Cycle: 111DMA crosses above 2x350DMA = top signal
function calcPiCycle(prices) {
  if (prices.length < 350) return null
  const ma111 = sma(prices, 111)
  const ma350x2 = sma(prices, 350) * 2
  const currentPrice = prices[prices.length - 1]
  // Distance as % — negative means 111DMA below 2x350DMA (not topped yet)
  const gap = ((ma111 - ma350x2) / ma350x2) * 100
  return { ma111, ma350x2, gap, currentPrice }
}

// MVRV Z-Score approximation from market cap / realized cap proxy
// Since realized cap requires on-chain data, we use a rough cycle-based proxy
function estimateMVRV(prices, currentPrice) {
  if (prices.length < 365) return null
  const yearLow = Math.min(...prices.slice(-365))
  const yearHigh = Math.max(...prices.slice(-365))
  const range = yearHigh - yearLow
  const position = range > 0 ? (currentPrice - yearLow) / range : 0
  // Scale to typical MVRV range 0–8
  return position * 7
}

export function useIndicators() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [fngRes, globalRes, btcChartRes, btcDetailRes] = await Promise.all([
          fetch('https://api.alternative.me/fng/?limit=30'),
          fetch(`${COINGECKO}/global`),
          fetch(`${COINGECKO}/coins/bitcoin/market_chart?vs_currency=usd&days=400&interval=daily`),
          fetch(`${COINGECKO}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`),
        ])

        const [fng, global, btcChart, btcDetail] = await Promise.all([
          fngRes.json(), globalRes.json(), btcChartRes.json(), btcDetailRes.json(),
        ])

        const prices = btcChart.prices.map(([, p]) => p)
        const currentPrice = btcDetail.bitcoin.usd
        const change24h = btcDetail.bitcoin.usd_24h_change
        const marketCap = btcDetail.bitcoin.usd_market_cap
        const totalMarketCap = global.data.total_market_cap.usd
        const btcDominance = global.data.market_cap_percentage.btc
        const ethDominance = global.data.market_cap_percentage.eth

        const ma50 = sma(prices, 50)
        const ma200 = sma(prices, 200)
        const ma111 = sma(prices, 111)
        const ma350 = sma(prices, 350)
        const rsi = calcRSI(prices)
        const piCycle = calcPiCycle(prices)
        const mvrvEst = estimateMVRV(prices, currentPrice)

        // Alt season: if most top alts outperform BTC over 90 days
        // Proxy: BTC dominance below 50% = alt season
        const altSeasonScore = Math.max(0, Math.min(100, (55 - btcDominance) * 4 + 50))

        // Fear & Greed history for chart
        const fngHistory = fng.data?.slice(0, 30).reverse().map(d => ({
          value: parseInt(d.value),
          label: d.value_classification,
          date: new Date(d.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })) || []

        const currentFng = fngHistory[fngHistory.length - 1]

        setData({
          currentPrice,
          change24h,
          marketCap,
          totalMarketCap,
          btcDominance,
          ethDominance,
          ma50,
          ma200,
          ma111,
          ma350,
          rsi,
          piCycle,
          mvrvEst,
          altSeasonScore,
          fngHistory,
          currentFng,
          prices,
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
