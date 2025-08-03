export const switchToHeklaChain = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x28C61', 
          chainName: 'Taiko Hekla Testnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.hekla.taiko.xyz'],
          blockExplorerUrls: ['https://hekla.tps.taiko.xyz'],
        },
      ],
    })
  } catch (err) {
    console.error('Switch to Hekla chain failed:', err)
  }
}