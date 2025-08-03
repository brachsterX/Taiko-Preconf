import React, { useState, useEffect, useRef } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { createPublicClient, webSocket } from 'viem'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { TxProgressBar } from './TxProgressBar'
import { taikoChain, publicClient } from './chains'

const WSS_URL = import.meta.env.VITE_WSS_URL

export function UserTxTracker({ setUserTxHash }) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [txHash, setTxHash] = useState(null)
  const [status, setStatus] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const timerRef = useRef(null)
  const { width, height } = useWindowSize()

  const sendTx = async () => {
    if (!walletClient || !address) return
    setStatus('⏳ Sending...')
    
    

    try {
      const tx = await walletClient.sendTransaction({
        to: address,
        value: parseEther('0.00001'),
        chain: taikoChain,
      })

      setTxHash(tx)
      setStartTime(Date.now())
      setElapsed(0)
      setUserTxHash(tx)
      setStatus('✅ Sent — waiting for preconfirmation...')

      setTimeout(() => {
        setStatus('🟡 Preconfirmed — waiting for inclusion...')
      }, 2000)

    } catch (err) {
      console.error('Tx failed:', err)
      setStatus('❌ Failed to send')
    }
  }

  useEffect(() => {
    if (!startTime) return

    timerRef.current = setInterval(() => {
      const now = Date.now()
      const seconds = ((now - startTime) / 1000).toFixed(2)
      setElapsed(seconds)
    }, 100)

    return () => clearInterval(timerRef.current)
  }, [startTime])

  useEffect(() => {
    if (!txHash || status.startsWith('🟢')) return

    const client = createPublicClient({
      transport: webSocket(WSS_URL),
      chain: taikoChain,
    })

    const unwatch = client.watchBlocks({
      onBlock: async (blockHeader) => {
        try {
          const fullBlock = await publicClient.getBlock({
            blockNumber: blockHeader.number,
          })

          const txs = fullBlock.transactions.map((t) =>
            typeof t === 'string' ? t : t.hash
          )

          if (txs.map((h) => h.toLowerCase()).includes(txHash.toLowerCase())) {
            setStatus(`🟢 Included in block ${fullBlock.number}`)
            clearInterval(timerRef.current)
            unwatch()
          }
        } catch (err) {
          console.warn('Block not ready yet')
        }
      },
    })

    return () => unwatch()
  }, [txHash, status])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Send Test Transaction</h2>

      {!isConnected ? (
        <p className="text-sm text-gray-400">Connect your wallet first</p>
      ) : (
        <button
          onClick={sendTx}
          className="bg-[#E81899] hover:brightness-110 py-2 px-4 rounded-xl shadow-lg"
        >
          Send 0.00001 ETH to Self
        </button>
      )}

      {txHash && (
        <p className="text-sm">
          Tx:{' '}
          <code className="bg-gray-800 px-2 py-1 rounded">
            {txHash.slice(0, 12)}...
          </code>{' '}
          – {status}
        </p>
      )}

      <TxProgressBar status={status} elapsed={elapsed} />

      {status.startsWith('🟢') && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0 }}
        />
      )}
    </div>
  )
}