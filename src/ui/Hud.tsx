import { useEffect, useRef } from 'react'
import { SECTIONS } from '../lib/content'
import { scrollToSection } from '../lib/hooks'
import { rig } from '../lib/rig'
import { useWorld } from '../store/world'

const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(1).padStart(5, '0')}° ${v >= 0 ? pos : neg}`

/** Top bar: wordmark, the active section and live readouts taken from the render loop. */
export function Hud() {
  const lat = useRef<HTMLSpanElement>(null)
  const lon = useRef<HTMLSpanElement>(null)
  const fps = useRef<HTMLSpanElement>(null)
  const section = useWorld((s) => s.section)
  const webgl = useWorld((s) => s.webgl)
  const idx = SECTIONS.findIndex((s) => s.id === section)

  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (t - last < 120) return
      last = t
      if (lat.current) lat.current.textContent = fmt(rig.facing.lat, 'N', 'S')
      if (lon.current) lon.current.textContent = fmt(rig.facing.lon, 'E', 'W')
      if (fps.current) fps.current.textContent = webgl ? `${Math.round(rig.fps)} fps` : 'static'
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [webgl])

  return (
    <header className="hud">
      <button type="button" className="wordmark" onClick={() => scrollToSection('surface')} aria-label="GeoVerse, back to top">
        <span className="wordmark-orb" aria-hidden />
        <span>
          Geo<em>Verse</em>
        </span>
      </button>
      <div className="hud-section" aria-live="polite">
        <span className="hud-index">{String(idx + 1).padStart(2, '0')}/{String(SECTIONS.length).padStart(2, '0')}</span>
        <span key={section} className="hud-name">
          {SECTIONS[idx]?.label}
        </span>
      </div>
      <dl className="hud-readout" aria-label="Live view readout">
        <div>
          <dt>Lat</dt>
          <dd ref={lat}>000.0° N</dd>
        </div>
        <div>
          <dt>Lon</dt>
          <dd ref={lon}>000.0° E</dd>
        </div>
        <div className="hud-fps">
          <dt>Render</dt>
          <dd ref={fps}>-- fps</dd>
        </div>
      </dl>
    </header>
  )
}
