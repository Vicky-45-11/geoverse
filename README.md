# GeoVerse

**Explore beyond the surface.** A real-time 3D Earth experience featuring interactive WebGL environments, custom shaders and cinematic motion design.

GeoVerse is an independent concept inspired by the name and idea of [globe-jamun.vercel.app](https://globe-jamun.vercel.app/). It is not affiliated with that site and shares none of its code. The Earth is rendered live in the browser from open imagery, and the surrounding worlds are procedural.

## Features

- **Realistic 3D Earth.** A custom GLSL surface over open Earth imagery: daytime colour with relief from a normal map, sun glint on the oceans (from a water mask), a soft terminator, city lights on the night side, a lit cloud layer that drifts slightly faster than the ground, and a fresnel atmosphere. Drag anywhere to spin it (with inertia), and the camera follows the pointer.
- **Orbit dock navigation.** A compact command dock with a scroll-progress orbit and one node per section. Keys `1`-`5` jump between sections.
- **World Explorer.** Five real places (Himalaya, Amazon Basin, Sahara, Great Barrier Reef, Antarctica) at their real coordinates. Choosing one from the list or clicking its marker turns the globe to face you, flies the camera in and lights a focus ring in the shader. Use `<-` `->` to step through them and `Esc` to return to the overview. The notes are short general facts, not live data.
- **Three environments.** Deep Field (a domain-warped nebula and star field), Orbital Lattice (an illustrative relay network of fibonacci-sphere nodes with pulses on nearest-neighbour links) and Crystal Isles (one instanced draw call of faceted crystals).
- **Object Lab.** Four globe views (Realistic, Night lights, Atlas, Hologram), three colour themes, key-light direction and intensity, Orbit/Polar/Close-up camera views, toggles for orbit paths and the Moon, a satellite constellation, bloom and auto-rotate, and a reset button. Every control drives real uniforms or scene state. Orbits, satellites and the Moon are illustrative and not to scale.
- **Scroll choreography.** Normal native scrolling. An IntersectionObserver picks the active section, and the camera and globe ease to each section's pose. Text masks reveal and layers have a little depth parallax.
- **Cursor and feedback.** A dot-and-ring cursor that changes for links, drag surfaces and place markers (desktop only), magnetic buttons and hover lighting on the surface.
- **Robustness.** WebGL detection with a static fallback, an error boundary, WebGL context-loss handling, a loader that can't trap the visitor, a render loop that pauses while the tab is hidden, an adaptive pixel ratio that measures real frame times, a lighter quality tier on mobile and low-core devices, and `prefers-reduced-motion` support.

## Stack

Vite 5, React 18, TypeScript, three.js 0.169, React Three Fiber 8, @react-three/postprocessing (bloom) and zustand. There is no GSAP, Framer Motion or Tailwind: native scroll, CSS transitions and a damped per-frame rig cover the motion, which keeps the bundle lean. The three.js scene is lazy-loaded with a dynamic import.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm run build && npm run preview
```

Screenshot tour (needs a Chromium build): `CHROME=/path/to/chrome node scripts/shots.mjs http://localhost:5173/ screenshots`.

Demo video: `node scripts/record.mjs "http://localhost:5173/?capture" frames` captures frame-accurate PNGs (the `?capture` flag hands the render clock to the recorder), then `video/build.sh frames demo.mp4` encodes them with a closing card and an ffmpeg-synthesised soundtrack.

## Structure

```
src/
  lib/        content (regions, environments, presets), shared per-frame rig, DOM hooks
  store/      zustand world state (section, region, environment, lab)
  scene/      Canvas setup, World choreography, Planet, Orbitals, poses, lighting
    shaders/    simplex noise, planet + atmosphere, ring, dust, crystals, lattice, nebula
    environments/  CrystalIsles, OrbitalLattice, DeepField
  ui/         HUD, OrbitDock, Cursor, overlays, sections/
```

## Credits

- Earth textures: derived from the three.js examples (`examples/textures/planets`, MIT). See `src/assets/README.md`.
- Simplex noise by Ian McEwan and Ashima Arts (MIT).
- Video soundtrack approach adapted from [latent-spaces/brag](https://github.com/latent-spaces/brag) (MIT).
