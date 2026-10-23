import { lazy, Suspense, useEffect } from 'react'
import { THEMES } from './lib/content'
import { useEnvironmentFlags, useKeyboardShortcuts, useMagnetic, usePointerControls, useScrollChoreography } from './lib/hooks'
import { hasWebGL } from './lib/rig'
import { useWorld } from './store/world'
import { Cursor } from './ui/Cursor'
import { Hud } from './ui/Hud'
import { OrbitDock } from './ui/OrbitDock'
import { ContextLost, Loader, SceneBoundary, StaticWorld } from './ui/Overlays'
import { Beyond } from './ui/sections/Beyond'
import { Explore } from './ui/sections/Explore'
import { Lab } from './ui/sections/Lab'
import { Interlude, Surface } from './ui/sections/Surface'
import { Worlds } from './ui/sections/Worlds'

// three.js and the scene only download once the page shell is up
const WorldCanvas = lazy(() => import('./scene/WorldCanvas'))

const webglAvailable = hasWebGL()

export default function App() {
  const webgl = useWorld((s) => s.webgl)
  const theme = useWorld((s) => s.lab.theme)

  useEffect(() => {
    if (!webglAvailable) useWorld.getState().set({ webgl: false, ready: true })
  }, [])
  useEffect(() => {
    const t = THEMES.find((x) => x.id === theme) ?? THEMES[0]
    document.documentElement.style.setProperty('--accent', t.accent)
    document.documentElement.style.setProperty('--accent-soft', t.soft)
  }, [theme])

  useEnvironmentFlags()
  useScrollChoreography()
  usePointerControls()
  useKeyboardShortcuts()
  useMagnetic()

  return (
    <>
      <a className="skip" href="#explore">
        Skip to the explorer
      </a>
      <div className="stage" aria-hidden>
        {webgl && webglAvailable ? (
          <SceneBoundary>
            <Suspense fallback={null}>
              <WorldCanvas />
            </Suspense>
          </SceneBoundary>
        ) : (
          <StaticWorld reason="WebGL is unavailable on this device, so you are seeing a static preview." />
        )}
      </div>
      <div className="grain" aria-hidden />
      <Hud />
      <main>
        <Surface />
        <Interlude />
        <Explore />
        <Worlds />
        <Lab />
        <Beyond />
      </main>
      <OrbitDock />
      <Cursor />
      <ContextLost />
      <Loader />
    </>
  )
}
