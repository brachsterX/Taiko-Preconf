import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { WalletProvider } from './WalletProvider'
import { SignedProvider } from './SignedContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <SignedProvider>
      <App />
      </SignedProvider>
    </WalletProvider>
  </React.StrictMode>
)