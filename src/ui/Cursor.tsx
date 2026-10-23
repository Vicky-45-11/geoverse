import { useEffect, useRef } from 'react'
import { REGIONS } from '../lib/content'
import { useWorld } from '../store/world'

/** dot + trailing ring; reads context from what is under the pointer. Desktop and full motion only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const p = { x: -100, y: -100 }
    const r = { x: -100, y: -100 }
    let mode = ''
    let raf = 0
    const onMove = (e: PointerEvent) => {
      p.x = e.clientX
      p.y = e.clientY
      const t = e.target as HTMLElement
      const hover = useWorld.getState().hoverRegion
      let next = ''
      let text = ''
      if (hover) {
        next = 'region'
        text = REGIONS.find((x) => x.id === hover)?.name ?? ''
      } else if (t.closest('button, a, [role="radio"], input')) next = 'link'
      else if (t.closest('[data-drag]')) {
        next = 'drag'
        text = 'Drag'
      }
      if (next !== mode) {
        mode = next
        ring.current?.setAttribute('data-mode', mode)
      }
      if (label.current && label.current.textContent !== text) label.current.textContent = text
    }
    const tick = () => {
      const reduced = useWorld.getState().reducedMotion
      const k = reduced ? 1 : 0.2
      r.x += (p.x - r.x) * k
      r.y += (p.y - r.y) * k
      if (dot.current) dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    const hide = () => document.documentElement.classList.add('cursor-away')
    const show = () => document.documentElement.classList.remove('cursor-away')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', hide)
    document.addEventListener('pointerenter', show)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', hide)
      document.removeEventListener('pointerenter', show)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div className="cursor" aria-hidden>
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}
