import React, { useState } from 'react'

import { SimulationProvider } from './context/SimulationContext.jsx'

import Landing from './pages/Landing.jsx'
import Driver from './pages/Driver.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const [screen, setScreen] = useState('landing')

  return (
    <SimulationProvider>

      {screen === 'landing' && (
        <Landing onSelect={setScreen} />
      )}

      {screen === 'driver' && (
        <Driver onNavigate={setScreen} />
      )}

      {screen === 'admin' && (
        <Admin onNavigate={setScreen} />
      )}

    </SimulationProvider>
  )
}