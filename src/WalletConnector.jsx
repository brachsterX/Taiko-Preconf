import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useSigned } from './SignedContext'


export function WalletConnector() {
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
        // console.log('✅ Signature successful')
      } catch (err) {
        console.warn('❌ Signature rejected')
        disconnect()
      }
    },
    onError(error) {
      console.error('Connection error:', error)
    },
  })

  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { signed, setSigned } = useSigned()
  
  return (
    <div className="space-y-2">
      {!isConnected ? (
        <button onClick={() => connect()}>Connect Wallet</button>
      ) : (
        <>
          <button onClick={() => disconnect()}>Disconnect</button>
          {signed ? (
            <p className="text-sm text-green-400">✅ Signed in as {address.slice(0, 6)}…{address.slice(-4)}</p>
          ) : (
            <p className="text-sm text-yellow-400">⚠️ Awaiting signature...</p>
          )}
        </>
      )}
    </div>
  )
}