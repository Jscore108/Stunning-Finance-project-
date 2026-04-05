import React, { createContext, useContext, useState, useCallback } from 'react'

const PortfolioContext = createContext(null)

// Default positions: { coinId, symbol, name, amount, avgBuyPrice }
const DEFAULT_POSITIONS = [
  { id: 'bitcoin',       symbol: 'BTC',  name: 'Bitcoin',   amount: 0.45,   avgBuyPrice: 38000 },
  { id: 'ethereum',      symbol: 'ETH',  name: 'Ethereum',  amount: 4.2,    avgBuyPrice: 2100  },
  { id: 'solana',        symbol: 'SOL',  name: 'Solana',    amount: 35,     avgBuyPrice: 95    },
  { id: 'chainlink',     symbol: 'LINK', name: 'Chainlink', amount: 200,    avgBuyPrice: 12.5  },
  { id: 'cardano',       symbol: 'ADA',  name: 'Cardano',   amount: 5000,   avgBuyPrice: 0.42  },
  { id: 'avalanche-2',   symbol: 'AVAX', name: 'Avalanche', amount: 25,     avgBuyPrice: 28    },
  { id: 'polkadot',      symbol: 'DOT',  name: 'Polkadot',  amount: 150,    avgBuyPrice: 6.8   },
  { id: 'uniswap',       symbol: 'UNI',  name: 'Uniswap',   amount: 120,    avgBuyPrice: 7.2   },
]

const WATCHLIST_DEFAULT = [
  'bitcoin', 'ethereum', 'solana', 'chainlink', 'cardano',
  'avalanche-2', 'polkadot', 'uniswap', 'dogecoin', 'ripple',
  'sui', 'aptos', 'arbitrum', 'optimism', 'near',
]

export function PortfolioProvider({ children }) {
  const [positions, setPositions] = useState(DEFAULT_POSITIONS)
  const [watchlist] = useState(WATCHLIST_DEFAULT)

  const addPosition = useCallback((pos) => {
    setPositions(prev => [...prev, { ...pos, id: pos.coinId }])
  }, [])

  const removePosition = useCallback((coinId) => {
    setPositions(prev => prev.filter(p => p.id !== coinId))
  }, [])

  const updatePosition = useCallback((coinId, updates) => {
    setPositions(prev => prev.map(p => p.id === coinId ? { ...p, ...updates } : p))
  }, [])

  return (
    <PortfolioContext.Provider value={{ positions, watchlist, addPosition, removePosition, updatePosition }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  return useContext(PortfolioContext)
}
