# 🌍 GeoVerse

<div align="center">

### EXPLORE BEYOND THE SURFACE.

**An immersive, real-time 3D Earth experience.**

Travel across a living digital planet, explore extraordinary places, navigate procedural worlds, and interact with a globe powered by custom GLSL shaders and real-time WebGL rendering.

**One planet. Infinite perspectives. A universe to explore.**

![Project](https://img.shields.io/badge/PROJECT-INTERACTIVE%203D-2563EB?style=for-the-badge)
![Framework](https://img.shields.io/badge/FRAMEWORK-REACT%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Language](https://img.shields.io/badge/LANGUAGE-TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript)
![Graphics](https://img.shields.io/badge/GRAPHICS-WEBGL%20%7C%20GLSL-990000?style=for-the-badge)

[Explore Features](#-key-features) · [World Explorer](#-world-explorer) · [Object Lab](#-object-lab) · [Technology Stack](#-technology-stack) · [Getting Started](#-getting-started)

</div>

---

## 🚀 The Vision

GeoVerse transforms the familiar experience of looking at a globe into an immersive, interactive journey across a living digital planet.

From the atmospheric glow of Earth to the distant stars of a procedural nebula, every scene is designed to combine visual storytelling, real-time graphics, and meaningful interaction.

Explore geographic landmarks, switch between alternate planetary visualizations, discover abstract environments, and control the globe through an interactive 3D laboratory.

**GeoVerse is where geography meets generative worlds, and exploration becomes an experience.**

## ✨ Key Features

### 🌎 1. A Living, Real-Time 3D Earth

Experience a custom-rendered Earth built with three.js, React Three Fiber, and GLSL shaders.

- **Daytime surface:** Open Earth imagery provides the planet's visible surface colors.
- **Terrain relief:** A normal map adds lighting detail to the surface.
- **Ocean highlights:** A water mask helps create a subtle sun-glint effect.
- **Day–night transition:** A soft terminator blends the illuminated and dark sides of the planet.
- **City lights:** Night-side illumination adds depth to the Earth's dark hemisphere.
- **Cloud layer:** A separate cloud shell drifts slightly faster than the surface.
- **Atmospheric scattering effect:** A Fresnel-inspired shader creates a luminous atmospheric rim.
- **Interactive rotation:** Drag the globe to rotate it with inertial movement.
- **Pointer-aware camera:** Camera movement responds to pointer position for added depth.

The result is a layered planetary visualization that combines image-based surface detail with procedural lighting and atmospheric effects.

### 🧭 2. Orbit Dock Navigation

Navigate the experience through a compact command dock designed around the idea of orbital movement.

- A circular progress indicator tracks your journey.
- Each node corresponds to a section of the experience.
- Keyboard shortcuts let you jump directly between sections.
- The active section updates as you scroll.

**Keyboard controls:** Press `1`–`5` to jump to the corresponding section.

### 📍 3. World Explorer

Discover five remarkable destinations located at their real-world geographic coordinates.

<grid columns={2} gap={3}>
  <grid-item>
    <AsyncImage query="Himalayas snow covered mountain range aerial landscape" aspectRatio="5:4" width="100%"/>
    **The Himalayas**

    <text color="secondary" size="sm">High-altitude mountain systems and dramatic relief.</text>
  </grid-item>
  <grid-item>
    <AsyncImage query="Amazon Basin dense rainforest aerial river winding through jungle" aspectRatio="5:4" width="100%"/>
    **The Amazon Basin**

    <text color="secondary" size="sm">Vast tropical forests and interconnected river systems.</text>
  </grid-item>
  <grid-item>
    <AsyncImage query="Sahara desert golden sand dunes aerial landscape" aspectRatio="5:4" width="100%"/>
    **The Sahara**

    <text color="secondary" size="sm">Expansive desert landscapes across North Africa.</text>
  </grid-item>
  <grid-item>
    <AsyncImage query="Great Barrier Reef turquoise coral reef aerial ocean" aspectRatio="5:4" width="100%"/>
    **The Great Barrier Reef**

    <text color="secondary" size="sm">A vast coral reef system off northeastern Australia.</text>
  </grid-item>
  <grid-item>
    <AsyncImage query="Antarctica icy continent aerial blue glacial landscape" aspectRatio="5:4" width="100%"/>
    **Antarctica**

    <text color="secondary" size="sm">A continent of ice, glaciers, and extreme environments.</text>
  </grid-item>
</grid>

Each destination can be selected from the explorer list or through its globe marker.

When a destination is selected, GeoVerse:

1. Rotates the Earth to bring the location into view.
2. Animates the camera toward the selected region.
3. Illuminates a focus ring through the shader.
4. Displays a concise informational note.

Use the previous and next controls to move between destinations, or press `Esc` to return to the global overview.

*Destination notes provide general geographic information rather than live environmental or scientific measurements.*

### 🌌 4. Three Procedural Environments

Beyond Earth, GeoVerse opens the door to three distinct visual worlds.

<box gap={3}>
  <row align="start" gap={3}>
    <AsyncImage query="deep space purple blue nebula glowing gas clouds dense star field cinematic" aspectRatio="4:5" maxWidth="124px"/>
    <box flex="1" gap={1}>
      **Deep Field**

      A procedural cosmic environment featuring a domain-warped nebula, layered star fields, and luminous clouds. Designed to create the feeling of drifting through deep space.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <AsyncImage query="abstract orbital satellite network glowing nodes connecting lines against dark space futuristic scientific visualization" aspectRatio="4:5" maxWidth="124px"/>
    <box flex="1" gap={1}>
      **Orbital Lattice**

      An illustrative network of nodes distributed across a Fibonacci sphere, connected by pulsing nearest-neighbor links to evoke a futuristic orbital communications system.
    </box>
  </row>
  <divider color="subtle"/>
  <row align="start" gap={3}>
    <AsyncImage query="surreal low poly crystal islands floating in dark ocean faceted translucent geometric crystals cinematic 3d art" aspectRatio="4:5" maxWidth="124px"/>
    <box flex="1" gap={1}>
      **Crystal Isles**

      A surreal landscape of faceted crystalline formations, rendered with instanced geometry to create a distinctive procedural world with reduced draw-call overhead.
    </box>
  </row>
</box>

These environments are artistic, procedural visualizations rather than simulations of actual astronomical or satellite systems.

### 🧪 5. Object Lab

The Object Lab turns the Earth into a customizable real-time graphics experience.

**Globe visualization modes**

- Realistic — daytime surface imagery and atmospheric effects.
- Night Lights — emphasis on illuminated urban regions.
- Atlas — a map-inspired surface treatment.
- Hologram — a stylized digital planetary aesthetic.

**Customization controls**

- Three color themes.
- Adjustable key-light direction and intensity.
- Orbit, Polar, and Close-up camera views.
- Toggleable orbital paths and Moon visualization.
- Illustrative satellite constellation.
- Bloom effects.
- Automatic rotation.
- One-click reset.

Each control is intended to update actual shader uniforms or scene state rather than simply changing decorative interface elements.

*Orbital paths, satellites, and the Moon are illustrative and not represented to scale.*

### 🎥 6. Cinematic Scroll Choreography

GeoVerse combines native browser scrolling with coordinated camera movement.

- Intersection Observer-based active-section tracking.
- Camera easing between section-specific viewpoints.
- Layered depth and subtle parallax.
- Masked text reveals.
- Responsive framing across screen sizes.

The scrolling experience remains native instead of being replaced by a heavyweight animation framework.

### 🖱️ 7. Interactive Cursor & Feedback

A custom desktop cursor reinforces the sense of interacting directly with the globe.

- Dot-and-ring cursor treatment.
- Context-sensitive states for links, draggable surfaces, and location markers.
- Magnetic buttons.
- Surface hover lighting.
- Responsive interaction feedback.

Desktop-only cursor effects are kept separate from touch interactions on mobile.

## 🏗️ Technology Stack

| Technology | Role |
|---|---|
| Vite 5 | Development server and production bundling |
| React 18 | Component-based interface |
| TypeScript | Type-safe application logic |
| three.js 0.169 | 3D rendering engine |
| React Three Fiber 8 | Declarative React integration for three.js |
| @react-three/postprocessing | Post-processing effects, including bloom |
| GLSL | Custom Earth surface and atmospheric shaders |
| Zustand | Shared application state |
| WebGL | Browser-based GPU rendering |
| Intersection Observer | Scroll-based section detection |
| Web Audio API | Optional procedural audio, if enabled by the implementation |

GeoVerse deliberately avoids GSAP, Framer Motion, and Tailwind CSS. Native scrolling, CSS transitions, and a damped per-frame camera rig handle the experience's motion without those additional frameworks.

## 🧠 Rendering Architecture

The application is organized around several cooperating systems.

<box border radius="lg" padding={3} gap={2} align="center">
  <box background="surface-secondary" radius="md" padding={3} width="100%" align="center">
    **Experience Layer**

    <text color="secondary" size="sm" textAlign="center">Navigation · World Explorer · Object Lab · Story sections</text>
  </box>
  <icon name="arrow-down" size="xl" color="secondary"/>
  <box background="surface" border radius="md" padding={3} width="100%" align="center">
    **State & Interaction Layer**

    <text color="secondary" size="sm" textAlign="center">Zustand · Camera controls · Keyboard shortcuts · Scroll observer</text>
  </box>
  <icon name="arrow-down" size="xl" color="secondary"/>
  <box background="surface" border radius="md" padding={3} width="100%" align="center">
    **3D Scene Layer**

    <text color="secondary" size="sm" textAlign="center">React Three Fiber · three.js · Earth · Procedural environments</text>
  </box>
  <icon name="arrow-down" size="xl" color="secondary"/>
  <box background="surface-secondary" radius="md" padding={3} width="100%" align="center">
    **Graphics Layer**

    <text color="secondary" size="sm" textAlign="center">GLSL shaders · WebGL · Textures · Lighting · Post-processing</text>
  </box>
</box>

The three-dimensional scene is lazy-loaded through a dynamic import. User-interface controls communicate with the scene through application state and shader uniforms.

## ⚡ Performance & Reliability

GeoVerse is designed to remain usable across different hardware capabilities.

- **Adaptive rendering quality:** Pixel ratio adjusts according to measured frame times.
- **Mobile quality tier:** Lower-cost settings for phones and lower-core devices.
- **Visibility-aware rendering:** The render loop pauses when the browser tab is hidden.
- **Lazy loading:** The 3D scene is loaded dynamically.
- **WebGL detection:** A static fallback is provided when graphics support is unavailable.
- **Error boundary:** Rendering failures are handled without unnecessarily breaking the entire interface.
- **Context-loss handling:** The application accounts for WebGL context-loss events.
- **Recoverable loading:** The loader is designed not to trap users indefinitely.
- **Reduced-motion support:** Respects `prefers-reduced-motion` and reduces motion where appropriate.

These measures aim to balance visual fidelity, responsiveness, and resilience rather than assume every device can render the same effects at the same quality.

## 🚀 Getting Started

### Prerequisites

- Node.js compatible with the project dependencies.
- npm.
- A modern browser with WebGL support for the interactive globe.

### Installation

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_DIRECTORY>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the URL displayed in the terminal. The configured Vite development server uses `http://localhost:5173` by default.

### Available Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

- `dev` starts the local development server.
- `typecheck` runs the configured TypeScript checks.
- `lint` checks the codebase using the configured linting tools.
- `build` generates the production bundle.
- `preview` serves the production build locally.

### 📸 Capture Screenshots

Capture a visual tour using a compatible Chromium installation:

```bash
CHROME=/path/to/chrome node scripts/shots.mjs \
  http://localhost:5173/ screenshots
```

The development server must be running if the script targets the local application.

### 🎞️ Generate a Demo Video

The capture workflow can generate frame-accurate PNG sequences using a dedicated capture mode.

```bash
node scripts/record.mjs \
  "http://localhost:5173/?capture" frames
```

Then encode the captured frames:

```bash
video/build.sh frames demo.mp4
```

The documented workflow adds a closing card and an FFmpeg-generated soundtrack. It requires the relevant capture scripts, a compatible Chromium build, and FFmpeg to be installed and configured.

## 🗺️ Roadmap

- [ ] Expand the destination library with additional geographic landmarks.
- [ ] Add more planetary visualization modes.
- [ ] Improve shader quality and atmospheric effects.
- [ ] Introduce additional procedural environments.
- [ ] Refine accessibility and keyboard navigation.
- [ ] Improve low-end-device rendering quality.
- [ ] Add optional shareable exploration states.
- [ ] Expand automated browser and visual regression testing.

## ⚠️ Project Scope & Disclaimer

GeoVerse is an independent creative and technical project inspired by the concept of exploring a digital globe. It is not affiliated with, endorsed by, or sponsored by the referenced website or any geographic imagery provider.

The globe is rendered in real time using open imagery and procedural graphics. Satellite formations, orbital paths, and environmental scenes are illustrative visualizations rather than authoritative scientific simulations.

Imagery remains subject to its respective provider's license and attribution requirements.

## 👨‍💻 Built by Vicky

Created by [@Vicky-45-11](https://github.com/Vicky-45-11).

A project exploring the intersection of computer graphics, interactive 3D environments, procedural generation, and creative software engineering.

---

<div align="center">

### 🌍 GeoVerse

**Explore beyond the surface.**

*Look closer. Travel further. See the world differently.*

</div>
