import { SECTIONS } from '../lib/content'
import { scrollToSection } from '../lib/hooks'
import { useWorld } from '../store/world'

/** Compact command dock: a scroll-progress orbit plus one node per section. */
export function OrbitDock() {
  const section = useWorld((s) => s.section)
  return (
    <nav className="dock" aria-label="Sections">
      <svg className="dock-orbit" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="15" className="dock-orbit-track" />
        <circle cx="18" cy="18" r="15" className="dock-orbit-fill" pathLength={1} />
        <circle cx="18" cy="18" r="4.5" className="dock-orbit-core" />
      </svg>
      <ol className="dock-nodes">
        {SECTIONS.map((s, i) => {
          const active = s.id === section
          return (
            <li key={s.id}>
              <button
                type="button"
                className="dock-node"
                aria-current={active ? 'step' : undefined}
                aria-label={`${s.label} (key ${i + 1})`}
                onClick={() => scrollToSection(s.id)}
              >
                <span className="dock-dot" aria-hidden />
                <span className="dock-label">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
