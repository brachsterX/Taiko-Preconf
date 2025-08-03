import {
  WagmiConfig,
  createConfig,
  useAccount,
  useConnect,
  useDisconnect,
  configureChains,
} from 'wagmi'

import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { InjectedConnector } from 'wagmi/connectors/injected'

// ✅ Define Hekla Testnet
const hekla = {
  id: 167009,
  name: 'Hekla Testnet',
  network: 'hekla',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hekla.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Taiko Explorer', url: 'https://hekla.taikoscan.io' },
  },
  testnet: true,
}

// ✅ Set up chains and provider
const { chains, publicClient } = configureChains(
  [hekla],
  [
    jsonRpcProvider({
      rpc: () => ({ http: 'https://rpc.hekla.taiko.xyz' }),
    }),
  ]
)

const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient,
})

export function WalletProvider({ children }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
}

export function WalletConnector() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready}
        >
          {connector.name}
          {isLoading &&
            pendingConnector?.id === connector.id &&
            ' (connecting)'}
        </button>
      ))}
    </div>
  )
}