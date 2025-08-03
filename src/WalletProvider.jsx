// WalletProvider.jsx
import React from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

// Define the Taiko Hekla chain
const taikoHekla = {
  id: 167009,
  name: 'Taiko Hekla',
  network: 'taiko-hekla',
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
  blockExplorers: {
    default: { name: 'Taiko Explorer', url: 'https://hekla.taikoexplorer.com' },
  },
  testnet: true,
}

// Configure chains and provider
const { publicClient } = configureChains(
  [taikoHekla],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'https://rpc.hekla.taiko.xyz',
      }),
    }),
  ]
)

// Create wagmi config with autoConnect disabled
const config = createConfig({
  autoConnect: false,
  connectors: [
    new InjectedConnector({
      chains: [taikoHekla],
    }),
  ],
  publicClient,
})

export function WalletProvider({ children }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
}