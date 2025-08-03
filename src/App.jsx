import React, { useState } from 'react'
import { WalletConnector } from './WalletConnector'
import { UserTxTracker } from './UserTxTracker'
import { TransactionFeed } from './TransactionFeed'

function App() {
  const [userTxHash, setUserTxHash] = useState(null)
  return (
    <div className="min-h-screen bg-taiko-bg text-white flex items-center justify-center px-4 font-primary">
      <div className="max-w-xl w-full text-center space-y-10">
        <header>
          <img src="/taiko_logo.png" alt="Taiko logo" className="mx-auto mb-4 w-20" />
          <h1 className="text-4xl font-bold text-[#E81899]">
            Taiko Preconfirmation Visualizer
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Visualization of preconfs
          </p>
        </header>

        <div className="bg-taiko-card rounded-2xl p-6 shadow-lg space-y-6">
          <WalletConnector />
          <UserTxTracker setUserTxHash={setUserTxHash} />
          <TransactionFeed userTxHash={userTxHash} />
        </div>

        <footer className="text-xs text-gray-500">
          Built by brachster.eth
        </footer>
      </div>
    </div>
  )
}

export default App