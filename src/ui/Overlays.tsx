import { Component, useEffect, useState, type ReactNode } from 'react'
import { useWorld } from '../store/world'

export function Loader() {
  const ready = useWorld((s) => s.ready)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    // never trap the visitor behind the loader if the GPU is very slow
    const t = window.setTimeout(() => useWorld.getState().set({ ready: true }), 12000)
    return () => window.clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(t)
  }, [ready])
  if (gone) return null
  return (
    <div className={`loader${ready ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div className="loader-orb" aria-hidden />
      <p className="loader-title">GeoVerse</p>
      <p className="loader-step">{ready ? 'World ready' : 'Loading Earth imagery'}</p>
      <div className="loader-bar" aria-hidden>
        <span />
      </div>
    </div>
  )
}

/** CSS-only planet shown when WebGL is missing or the scene fails to start */
export function StaticWorld({ reason }: { reason: string }) {
  return (
    <div className="static-world" aria-hidden>
      <div className="static-planet" />
      <p className="static-note">{reason}</p>
    </div>
  )
}

export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error('Scene failed to start', err)
    useWorld.getState().set({ webgl: false, ready: true })
  }
  render() {
    if (this.state.failed) return <StaticWorld reason="The 3D scene could not start on this device, so you are seeing a static preview." />
    return this.props.children
  }
}

export function ContextLost() {
  const lost = useWorld((s) => s.contextLost)
  if (!lost) return null
  return (
    <div className="toast" role="alert">
      <p>The graphics context was lost, so the 3D scene has paused.</p>
      <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>
        Reload scene
      </button>
    </div>
  )
}
