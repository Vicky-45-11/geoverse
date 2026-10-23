import { ENVIRONMENTS, type EnvId } from '../../lib/content'
import { useWorld } from '../../store/world'

export function Worlds() {
  const env = useWorld((s) => s.env)
  const setEnv = useWorld((s) => s.setEnv)

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
    const next = ENVIRONMENTS[(i + dir + ENVIRONMENTS.length) % ENVIRONMENTS.length].id
    setEnv(next)
    document.getElementById(`env-${next}`)?.focus()
  }

  return (
    <section id="worlds" className="sec sec-worlds" data-drag aria-labelledby="worlds-title">
      <div className="panel panel-left panel-wide" data-nodrag>
        <p className="label" data-reveal>
          <span className="label-num">03</span> Environments
        </p>
        <h2 id="worlds-title" tabIndex={-1} data-section-heading data-reveal>
          Change the world around it.
        </h2>
        <div className="env-list" role="radiogroup" aria-label="Environment">
          {ENVIRONMENTS.map((e, i) => (
            <button
              key={e.id}
              id={`env-${e.id}`}
              type="button"
              role="radio"
              aria-checked={env === e.id}
              tabIndex={env === e.id ? 0 : -1}
              className="env-row"
              onClick={() => setEnv(e.id as EnvId)}
              onKeyDown={(ev) => onKey(ev, i)}
            >
              <span className="env-name">{e.name}</span>
              <span className="env-body">{e.body}</span>
              <span className="env-detail mono">{e.detail}</span>
            </button>
          ))}
        </div>
        <p className="fineprint">Your choice stays with you as you scroll on.</p>
      </div>
    </section>
  )
}
