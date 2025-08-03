import React, { useEffect, useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { parseEther } from 'viem'
import { createPublicClient, webSocket } from 'viem'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'



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

export function UserTxTracker({ txHash, setTxHash }) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { width, height } = useWindowSize()

  // const [txHash, setTxHash] = useState(null)
  const [status, setStatus] = useState('')

  const sendTx = async () => {
    if (!walletClient || !address) return

    setStatus('⏳ Sending...')

    try {
      const tx = await walletClient.sendTransaction({
        to: address,
        value: parseEther('0.00001'),
        chain: {
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
            },
          },
        },
      })

      const txHash = tx
      setTxHash(txHash)

      // Check last 5 blocks in case tx is already included
      const latestBlock = await publicClient.getBlockNumber()
      for (let i = 0n; i < 5n; i++) {
        const block = await publicClient.getBlock({ blockNumber: latestBlock - i })
        const txs = block.transactions.map((t) =>
          typeof t === 'string' ? t : t.hash
        )

        if (txs.map(h => h.toLowerCase()).includes(txHash.toLowerCase())) {
          setStatus(`🟢 Included in block ${block.number}`)
          return
        }
      }

      // Simulate preconfirmation after 2s
      setStatus('✅ Sent — waiting for preconfirmation...')
      setTimeout(() => {
        setStatus('🟡 Preconfirmed — waiting for inclusion...')
      }, 2000)

      // console.log('TX sent:', txHash)
    } catch (err) {
      console.error('Tx failed:', err)
      setStatus('❌ Failed to send')
    }
  }

  useEffect(() => {
  if (!txHash || status.startsWith('🟢')) return

  const client = createPublicClient({
    transport: webSocket(WSS_URL),
    chain: taikoChain,
  })

  const unwatch = client.watchBlocks({
    onBlock: async (blockHeader) => {
      // console.log('🧱 Header block:', Number(blockHeader.number))
      // console.log('Expected txHash:', txHash.toLowerCase())

      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const fullBlock = await publicClient.getBlock({ blockNumber: blockHeader.number })
        const txs = fullBlock.transactions.map((t) =>
          typeof t === 'string' ? t : t.hash
        )

        // console.log('Txs in block:', txs.map((h) => h.toLowerCase()))

        if (txs.map(h => h.toLowerCase()).includes(txHash.toLowerCase())) {
          // console.log('✅ MATCH FOUND — updating status')
          setStatus(`🟢 Included in block ${fullBlock.number}`)
          unwatch()
        } else {
          // console.log('❌ No match in this block')
        }
      } catch (err) {
        console.error('Failed to fetch full block:', err)
      }
    },
  })

  return () => unwatch()
}, [txHash, status, publicClient, WSS_URL])

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Send Test Transaction</h2>
      {!isConnected ? (
        <p>Connect wallet first</p>
      ) : (
        <button onClick={sendTx} disabled={status === '⏳ Sending...'}>
          Send 0.00001 ETH to Self
        </button>
      )}
      {txHash && (
        <p>
          Tx: <code>{txHash.slice(0, 12)}...</code> – {status}
        </p>
      )}

      {status.startsWith('🟢 Included') && width > 0 && height > 0 && (
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