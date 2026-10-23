/**
 * Per-frame values shared between the DOM and the render loop.
 * Kept out of React state so pointer moves and scrolling never re-render the tree.
 */
export const rig = {
  /** pointer in -1..1, y up */
  pointer: { x: 0, y: 0 },
  /** drag velocity applied to the planet, radians per frame-ish */
  spin: { x: 0, y: 0 },
  dragging: false,
  /** 0..1 progress through the first viewport */
  hero: 0,
  /** 0..1 progress through the whole page */
  page: 0,
  /** latitude / longitude of the point facing the camera, degrees */
  facing: { lat: 0, lon: 0 },
  fps: 60,
  dpr: 1,
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

/** shortest signed angular distance from a to b */
export function angleDelta(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

export function latLonToVec(lat: number, lon: number, r = 1): [number, number, number] {
  const la = (lat * Math.PI) / 180
  const lo = (lon * Math.PI) / 180
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)]
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
