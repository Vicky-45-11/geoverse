import { scrollToSection } from '../../lib/hooks'

export function Surface() {
  return (
    <section id="surface" className="sec sec-surface" data-drag aria-labelledby="surface-title">
      {/* the headline sits behind the canvas, so the planet passes in front of it */}
      <div className="hero-type" aria-hidden>
        <span className="hero-word hero-word-a">Geo</span>
        <span className="hero-word hero-word-b">Verse</span>
      </div>
      <div className="hero-ui">
        <p className="eyebrow">A real-time 3D Earth · rendered live in WebGL</p>
        <div className="hero-foot">
          <div className="hero-copy">
            <h1 id="surface-title" tabIndex={-1} data-section-heading>
              <span className="sr-only">GeoVerse. </span>Explore beyond the surface.
            </h1>
            <p className="lede">
              A real-time 3D Earth you can turn with your hands: city lights, ocean glint and a drifting cloud layer. Fly to five real places, change the world around it, and remake how it looks.</p>
            <div className="actions">
              <button type="button" className="btn btn-solid magnetic" onClick={() => scrollToSection('explore')}>
                Begin exploring
              </button>
              <button type="button" className="btn btn-ghost magnetic" onClick={() => scrollToSection('lab')}>
                Open the Object Lab
              </button>
            </div>
          </div>
          <p className="hint">
            <span className="hint-key" aria-hidden>⟲</span> Drag anywhere to spin the globe
          </p>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden>
        <span />
      </div>
    </section>
  )
}

export function Interlude() {
  return (
    <section className="interlude" aria-label="Introduction">
      <p className="interlude-line" data-reveal data-depth="0.06">
        A world you can hold.
      </p>
      <p className="interlude-line dim" data-reveal data-depth="0.12">
        Turn it. Read it.
      </p>
      <p className="interlude-line accent" data-reveal data-depth="0.18">
        Change how you see it.
      </p>
    </section>
  )
}
