import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export function TransactionFeed({ userTxHash }) {
  const [txs, setTxs] = useState(null) // start with null to show skeleton

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await axios.get(
          'https://cdn.testnet.routescan.io/api/evm/all/transactions?count=true&includedChainIds=167009&limit=10&sort=desc'
        )
        const items = res.data.items || []
        setTxs(items)
      } catch (err) {
        console.error('Failed to fetch transactions', err)
      }
    }

    fetchTxs()
    const interval = setInterval(fetchTxs, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-taiko-card rounded-xl p-4 shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-[#E81899]">Latest Transactions</h2>

      {/* Skeleton shimmer */}
      {!txs && (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded-md"></div>
          ))}
        </div>
      )}

      <ul className="text-sm space-y-2">
        <AnimatePresence>
          {txs?.map((tx) => {
            const hash = tx.txHash
            const shortHash = `${hash.slice(0, 8)}...${hash.slice(-6)}`
            const time = new Date(tx.timestamp).toLocaleTimeString()
            const status = tx.status ? '🟢' : '🔴'
            const link = `https://hekla.taikoexplorer.com/tx/${hash}`
            const isUserTx = userTxHash && hash.toLowerCase() === userTxHash.toLowerCase()

            return (
              <motion.li
                key={hash}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex justify-between items-center border px-3 py-2 rounded-lg transition ${
                  isUserTx
                    ? 'bg-[#5D07C8]/20 border-[#5D07C8]'
                    : 'hover:bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono hover:underline text-sm"
                  >
                    <span>{status}</span>
                    <span>{shortHash}</span>
                  </a>
                  <span className="text-gray-400 text-xs">Block #{tx.blockNumber}</span>
                </div>
                <span className="text-gray-500 text-xs">{time}</span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}