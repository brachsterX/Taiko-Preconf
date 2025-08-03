import React, { useState, useEffect, useRef } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { createPublicClient, webSocket } from 'viem'
import { TxProgressBar } from './TxProgressBar'

const WSS_URL = import.meta.env.VITE_WSS_URL

const taikoChain = {
  id: 167009,
  name: 'Taiko Hekla',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hekla.taiko.xyz'],
      webSocket: [WSS_URL],
    },
  },
}

export function UserTxTracker() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [txHash, setTxHash] = useState(null)
  const [status, setStatus] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  const progress = Math.min(status.startsWith('🟢 Included') ? 100 : elapsed * 10, 100)

  const sendTx = async () => {
    if (!walletClient || !address) return

    setStatus('⏳ Sending...')
    setStartTime(null)
    setElapsed(0)
    setTxHash(null)

    try {
      const tx = await walletClient.sendTransaction({
        to: address,
        value: parseEther('0.00001'),
        chain: taikoChain,
      })

      setTxHash(tx)
      setStatus('✅ Sent — waiting for preconfirmation...')
      setStartTime(Date.now())

      setTimeout(() => {
        setStatus('🟡 Preconfirmed — waiting for inclusion...')
      }, 2000)

      // console.log('TX sent:', tx)
    } catch (err) {
      console.error('Tx failed:', err)
      setStatus('❌ Failed to send')
    }
  }

  useEffect(() => {
    if (!startTime) return

    timerRef.current = setInterval(() => {
      const now = Date.now()
      const seconds = ((now - startTime) / 1000).toFixed(2) // includes ms
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
        // console.log('🧱 Header block:', Number(blockHeader.number))

        try {
          const fullBlock = await client.getBlock({ blockNumber: blockHeader.number })
          const txs = fullBlock.transactions.map((t) =>
            typeof t === 'string' ? t : t.hash
          )

          if (txs.map(h => h.toLowerCase()).includes(txHash.toLowerCase())) {
            setStatus(`🟢 Included in block ${fullBlock.number}`)
            clearInterval(timerRef.current)
            unwatch()
          }
        } catch (err) {
          console.error('Failed to fetch full block:', err)
        }
      },
    })

    return () => unwatch()
  }, [txHash, status])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Send Test Transaction</h2>
      {!isConnected ? (
        <p>Connect wallet first</p>
      ) : (
        <button onClick={sendTx} disabled={status === '⏳ Sending...'}>
          Send 0.00001 ETH to Self
        </button>
      )}
      {txHash && (
        <>
          <p>
            Tx: <code>{txHash.slice(0, 12)}...</code> – {status}
          </p>
          <TxProgressBar status={status} elapsed={elapsed} />
        </>
      )}
    </div>
  )
}