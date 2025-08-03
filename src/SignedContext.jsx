import React, { createContext, useContext, useState } from 'react'

const SignedContext = createContext()

export const SignedProvider = ({ children }) => {
  const [signed, setSigned] = useState(false)
  return (
    <SignedContext.Provider value={{ signed, setSigned }}>
      {children}
    </SignedContext.Provider>
  )
}

export const useSigned = () => useContext(SignedContext)