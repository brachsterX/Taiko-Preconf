// WalletConnector.jsx
import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export function WalletConnector() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess: async ({ account }) => {
      const message = 'Please sign this message to verify your wallet.'
      try {
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        })
        console.log('Signature:', signature)
      } catch (err) {
        console.error('Signature rejected or failed:', err)
      }
    },
  })

  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()

  const shortenAddress = (addr) =>
    addr.slice(0, 6) + '...' + addr.slice(addr.length - 4)

  return (
    <div className="flex flex-col items-center gap-3">
      {!isConnected ? (
        <button
          onClick={() => connect()}
          className="bg-[#E81899] text-white font-semibold px-5 py-2 rounded-xl shadow hover:brightness-110 transition"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-[#6ECFB0]">
            Connected: <span className="font-mono">{shortenAddress(address)}</span>
          </p>
          <button
            onClick={() => disconnect()}
            className="bg-gray-700 text-white text-sm px-4 py-1 rounded-md hover:bg-gray-600 transition"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}