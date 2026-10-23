import { REGIONS } from '../../lib/content'
import { useWorld } from '../../store/world'

const coord = (v: number, pos: string, neg: string) => `${Math.abs(v)}° ${v >= 0 ? pos : neg}`

export function Explore() {
  const region = useWorld((s) => s.region)
  const select = useWorld((s) => s.selectRegion)
  const step = useWorld((s) => s.stepRegion)
  const current = REGIONS.find((r) => r.id === region)
  const index = REGIONS.findIndex((r) => r.id === region)

  return (
    <section id="explore" className="sec sec-explore" data-drag aria-labelledby="explore-title">
      <div className="panel panel-left" data-nodrag>
        <p className="label" data-reveal>
          <span className="label-num">02</span> World Explorer
        </p>
        <h2 id="explore-title" tabIndex={-1} data-section-heading data-reveal>
          Five places, one planet.
        </h2>
        <p className="muted small" data-reveal>
          Pick a place or click a marker on the globe. The Earth turns to face you and the camera flies in.
        </p>

        <div className="region-list" role="group" aria-label="Places">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className="region-btn"
              aria-pressed={region === r.id}
              style={{ ['--glow' as string]: r.glow }}
              onClick={() => select(region === r.id ? null : r.id)}
            >
              <span className="region-dot" aria-hidden />
              <span className="region-name">{r.name}</span>
              <span className="region-kicker">{r.kicker}</span>
            </button>
          ))}
        </div>

        <div className="region-detail" aria-live="polite">
          {current ? (
            <article key={current.id} className="detail-card" style={{ ['--glow' as string]: current.glow }}>
              <p className="detail-meta">
                <span>
                  Place {index + 1} of {REGIONS.length}
                </span>
                <span className="mono">
                  {coord(current.lat, 'N', 'S')} · {coord(current.lon, 'E', 'W')}
                </span>
              </p>
              <h3>{current.name}</h3>
              <p>{current.body}</p>
              <p className="detail-trait">
                <span className="mono">Look for</span> {current.trait}
              </p>
              <div className="detail-actions">
                <button type="button" className="btn btn-icon" onClick={() => step(-1)} aria-label="Previous place">
                  ←
                </button>
                <button type="button" className="btn btn-icon" onClick={() => step(1)} aria-label="Next place">
                  →
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => select(null)}>
                  Return to overview
                </button>
              </div>
            </article>
          ) : (
            <p className="detail-empty">Overview. Nothing selected; the globe is free to spin.</p>
          )}
        </div>
        <p className="fineprint">Locations are real. The notes are short general facts, not live data.</p>
      </div>
    </section>
  )
}
