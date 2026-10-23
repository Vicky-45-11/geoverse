import { useEffect } from 'react'
import { SECTIONS, type SectionId } from './content'
import { rig } from './rig'
import { useWorld } from '../store/world'

export function scrollToSection(id: SectionId) {
  const el = document.getElementById(id)
  if (!el) return
  const smooth = !useWorld.getState().reducedMotion
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  const heading = el.querySelector<HTMLElement>('[data-section-heading]')
  heading?.focus({ preventScroll: true })
}

/** media queries -> store */
export function useEnvironmentFlags() {
  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 760px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      useWorld.getState().set({ mobile: mqMobile.matches, reducedMotion: mqMotion.matches })
      document.documentElement.classList.toggle('motion', !mqMotion.matches)
    }
    apply()
    if (mqMobile.matches) useWorld.getState().setLab({ bloom: false })
    mqMobile.addEventListener('change', apply)
    mqMotion.addEventListener('change', apply)
    return () => {
      mqMobile.removeEventListener('change', apply)
      mqMotion.removeEventListener('change', apply)
    }
  }, [])
}

/** active section, hero/page progress, parallax and reveal-on-enter */
export function useScrollChoreography() {
  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) useWorld.getState().setSection(e.target.id as SectionId)
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    sections.forEach((s) => io.observe(s))

    // only content that starts below the fold waits for a reveal, so the first frame is complete
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) el.classList.add('pending')
    })
    const rio = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.remove('pending')
            rio.unobserve(e.target)
          }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    reveals.forEach((el) => rio.observe(el))

    const depth = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]'))
    let raf = 0
    const update = () => {
      raf = 0
      const h = window.innerHeight
      const max = document.documentElement.scrollHeight - h
      rig.hero = Math.min(1, Math.max(0, window.scrollY / h))
      rig.page = max > 0 ? window.scrollY / max : 0
      document.documentElement.style.setProperty('--hero', rig.hero.toFixed(4))
      document.documentElement.style.setProperty('--page', rig.page.toFixed(4))
      if (useWorld.getState().reducedMotion) return
      for (const el of depth) {
        const r = el.getBoundingClientRect()
        const off = (r.top + r.height / 2 - h / 2) * Number(el.dataset.depth)
        el.style.transform = `translate3d(0, ${(-off).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      rio.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
}

const INTERACTIVE = 'button, a, input, select, textarea, label, [data-nodrag]'

/** pointer position for parallax, and drag-to-spin on any [data-drag] surface */
export function usePointerControls() {
  useEffect(() => {
    let last: { x: number; y: number; id: number } | null = null
    const onMove = (e: PointerEvent) => {
      rig.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      rig.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (!last || e.pointerId !== last.id) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY, id: e.pointerId }
      rig.spin.x = dx * 0.0055
      rig.spin.y = dy * 0.0035
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('[data-drag]') || t.closest(INTERACTIVE)) return
      const { section, region } = useWorld.getState()
      if (section === 'explore' && region) return
      last = { x: e.clientX, y: e.clientY, id: e.pointerId }
      rig.dragging = true
      document.documentElement.classList.add('is-dragging')
    }
    const onUp = () => {
      last = null
      rig.dragging = false
      document.documentElement.classList.remove('is-dragging')
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])
}

/** 1-5 jump between sections, Esc returns the explorer to overview, arrows step regions */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
      const n = Number(e.key)
      if (n >= 1 && n <= SECTIONS.length) {
        scrollToSection(SECTIONS[n - 1].id)
        return
      }
      const s = useWorld.getState()
      if (e.key === 'Escape' && s.region) s.selectRegion(null)
      if (s.section === 'explore' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !t.closest('[role="radiogroup"]')) {
        e.preventDefault()
        s.stepRegion(e.key === 'ArrowRight' ? 1 : -1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** subtle magnetic pull toward the pointer, desktop only */
export function useMagnetic() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'))
    const handlers = els.map((el) => {
      const move = (e: PointerEvent) => {
        if (useWorld.getState().reducedMotion) return
        const r = el.getBoundingClientRect()
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      }
      const leave = () => (el.style.transform = '')
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })
    return () => handlers.forEach((h) => h())
  }, [])
}
