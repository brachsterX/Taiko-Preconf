import React from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useSigned } from './SignedContext'

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}


export function WalletConnector() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { signed, setSigned } = useSigned()

  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess: async ({ account }) => {
      try {
        const msg = 'Sign to verify wallet ownership.'
        await window.ethereum.request({
          method: 'personal_sign',
          params: [msg, account],
        })
        setSigned(true)
      } catch (err) {
        console.warn('❌ Signature rejected')
        disconnect()
      }
    },
    onError(error) {
      console.error('Connection error:', error)
    },
  })

  const handleConnect = () => {
    if (typeof window.ethereum === 'undefined') {
      if (isMobile()) {
        // Open MetaMask app via deep link on mobile
        const dappUrl = window.location.href.replace(/^https?:\/\//, '') // Remove protocol
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`
      } else {
        alert('MetaMask not detected. Please install it first.')
      }
    } else {
      connect()
    }
  }

  return (
    <div className="space-y-2 flex flex-col items-center">
      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={disconnect}>Disconnect</button>
          {signed ? (
            <p className="text-sm text-green-400">
              ✅ Signed in as {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          ) : (
            <p className="text-sm text-yellow-400">⚠️ Awaiting signature...</p>
          )}
        </>
      )}
    </div>
  )
}