import { useEffect, useRef } from 'react'
import { MATERIALS, THEMES, VIEWS } from '../../lib/content'
import { rig } from '../../lib/rig'
import { useWorld, type LabState } from '../../store/world'

function Toggle({ id, label, k }: { id: string; label: string; k: keyof Pick<LabState, 'ring' | 'particles' | 'bloom' | 'autoRotate'> }) {
  const on = useWorld((s) => s.lab[k])
  const setLab = useWorld((s) => s.setLab)
  return (
    <button id={id} type="button" role="switch" aria-checked={on} className="switch" onClick={() => setLab({ [k]: !on })}>
      <span className="switch-track" aria-hidden>
        <span className="switch-thumb" />
      </span>
      {label}
    </button>
  )
}

export function Lab() {
  const lab = useWorld((s) => s.lab)
  const setLab = useWorld((s) => s.setLab)
  const reset = useWorld((s) => s.resetLab)
  const webgl = useWorld((s) => s.webgl)
  const stats = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const t = window.setInterval(() => {
      if (stats.current) stats.current.textContent = webgl ? `${Math.round(rig.fps)} fps · pixel ratio ${rig.dpr.toFixed(2)}` : 'WebGL unavailable'
    }, 500)
    return () => window.clearInterval(t)
  }, [webgl])

  return (
    <section id="lab" className="sec sec-lab" data-drag aria-labelledby="lab-title">
      <div className="panel panel-right" data-nodrag>
        <p className="label" data-reveal>
          <span className="label-num">04</span> Object Lab
        </p>
        <h2 id="lab-title" tabIndex={-1} data-section-heading data-reveal>
          Remake the globe.
        </h2>
        {!webgl && <p className="warn">WebGL is not available here, so these controls have nothing to drive.</p>}

        <fieldset className="ctl" disabled={!webgl}>
          <legend>Globe view</legend>
          <div className="chips">
            {MATERIALS.map((m) => (
              <button
                key={m.id}
                type="button"
                className="chip"
                aria-pressed={lab.material === m.id}
                style={{ ['--a' as string]: m.swatch[0], ['--b' as string]: m.swatch[1] }}
                onClick={() => setLab({ material: m.id })}
              >
                <span className="chip-swatch" aria-hidden />
                {m.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="ctl" disabled={!webgl}>
          <legend>Colour theme</legend>
          <div className="chips">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="chip"
                aria-pressed={lab.theme === t.id}
                style={{ ['--a' as string]: t.soft, ['--b' as string]: t.accent }}
                onClick={() => setLab({ theme: t.id })}
              >
                <span className="chip-swatch round" aria-hidden />
                {t.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="ctl ctl-split" disabled={!webgl}>
          <legend>Key light</legend>
          <label htmlFor="light-az">
            Direction <output className="mono">{lab.light}°</output>
          </label>
          <input id="light-az" type="range" min={0} max={360} step={1} value={lab.light} onChange={(e) => setLab({ light: Number(e.target.value) })} />
          <label htmlFor="light-int">
            Intensity <output className="mono">{lab.intensity.toFixed(2)}</output>
          </label>
          <input id="light-int" type="range" min={0.2} max={1.8} step={0.01} value={lab.intensity} onChange={(e) => setLab({ intensity: Number(e.target.value) })} />
        </fieldset>

        <fieldset className="ctl" disabled={!webgl}>
          <legend>Camera</legend>
          <div className="seg" role="group" aria-label="Camera view">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" aria-pressed={lab.view === v.id} onClick={() => setLab({ view: v.id })}>
                {v.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="ctl" disabled={!webgl}>
          <legend>Effects</legend>
          <div className="switches">
            <Toggle id="tg-ring" label="Orbits & Moon" k="ring" />
            <Toggle id="tg-dust" label="Satellites" k="particles" />
            <Toggle id="tg-bloom" label="Bloom" k="bloom" />
            <Toggle id="tg-rotate" label="Auto-rotate" k="autoRotate" />
          </div>
        </fieldset>

        <div className="lab-foot">
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={!webgl}>
            Reset lab
          </button>
          <span ref={stats} className="mono small muted">
            measuring…
          </span>
        </div>
      </div>
    </section>
  )
}
