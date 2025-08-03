import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export function TransactionFeed({ userTxHash }) {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const res = await axios.get(
          'https://cdn.testnet.routescan.io/api/evm/all/transactions?count=true&includedChainIds=167009&limit=10&sort=desc'
        )
        window.lastTxs = res.data.items
        setTxs(res.data.items)
      } catch (err) {
        console.error('Failed to fetch txs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTxs()
    const interval = setInterval(fetchTxs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Latest Transactions</h3>
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-6 bg-gray-700 animate-pulse rounded w-full"
            ></div>
          ))
        ) : (
          <AnimatePresence>
            {txs.map((tx) => {
              const isUserTx =
                userTxHash &&
                tx.txHash.toLowerCase() === userTxHash.toLowerCase()
                console.log('TX', tx.txHash, 'User TX?', isUserTx)

              return (
                <motion.div
                  key={tx.txHash}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`text-sm flex justify-between items-center p-2 rounded-md transition-all duration-300 ${
                    isUserTx
                      ? 'bg-[#6ECFB0]/20 border border-[#6ECFB0]'
                      : 'bg-[#1A1B23] border border-transparent'
                  }`}
                >
                  <a
                    href={`https://hekla.taikoexplorer.com/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E81899] hover:underline"
                  >
                    {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                  </a>
                  <span className="text-gray-400 ml-4">Block #{tx.blockNumber}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}