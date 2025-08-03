// src/chains.js
import { defineChain } from 'viem'

export const taikoChain = defineChain({
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
      webSocket: [import.meta.env.VITE_WSS_URL],
    },
  },
})

import { createPublicClient, http } from 'viem'

export const publicClient = createPublicClient({
  chain: taikoChain,
  transport: http(),
})