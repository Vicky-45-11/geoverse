import { scrollToSection } from '../../lib/hooks'

export function Beyond() {
  return (
    <section id="beyond" className="sec sec-beyond" data-drag aria-labelledby="beyond-title">
      <div className="beyond-inner">
        <p className="label" data-reveal>
          <span className="label-num">05</span> Beyond
        </p>
        <h2 id="beyond-title" className="beyond-title" tabIndex={-1} data-section-heading>
          <span className="mask" data-reveal>
            <span>The surface</span>
          </span>
          <span className="mask" data-reveal>
            <span>was only</span>
          </span>
          <span className="mask accent" data-reveal>
            <span>the start.</span>
          </span>
        </h2>
        <nav className="beyond-links" aria-label="Return to the experience" data-nodrag>
          <button type="button" className="btn btn-solid magnetic" onClick={() => scrollToSection('explore')}>
            Fly back to a place
          </button>
          <button type="button" className="btn btn-ghost magnetic" onClick={() => scrollToSection('lab')}>
            Return to the lab
          </button>
          <button type="button" className="btn btn-ghost magnetic" onClick={() => scrollToSection('surface')}>
            Back to the surface
          </button>
        </nav>
      </div>
      <footer className="colophon">
        <p>
          GeoVerse is an independent concept piece, inspired by globe-jamun.vercel.app but not affiliated with it. The Earth is rendered live
          with React Three Fiber and custom GLSL from open Earth imagery (three.js examples, MIT). The city lights, relay network and satellites are illustrative.
        </p>
        <p className="mono">Keys: 1–5 sections · ← → regions · Esc overview · Tab through every control</p>
      </footer>
    </section>
  )
}
