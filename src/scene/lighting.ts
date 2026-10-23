import * as THREE from 'three'

const v = new THREE.Vector3()

/** key light direction from the lab's azimuth slider (degrees); 0 lights the planet from the camera's right */
export function lightDirection(azimuth: number) {
  const a = (azimuth * Math.PI) / 180
  return v.set(Math.cos(a), 0.42, Math.sin(a)).normalize()
}
