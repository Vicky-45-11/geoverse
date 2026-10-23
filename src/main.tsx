import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { rig } from './lib/rig'
import { useWorld } from './store/world'
import './styles.css'

// handy for scripted checks
;(window as unknown as { __world: typeof useWorld; __rig: typeof rig }).__world = useWorld
;(window as unknown as { __rig: typeof rig }).__rig = rig

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
