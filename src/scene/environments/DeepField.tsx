import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { THEMES } from '../../lib/content'
import { useWorld } from '../../store/world'
import { nebulaFragment, nebulaVertex } from '../shaders/fx'
import { useFade } from './useFade'

const tmp = new THREE.Color()

/** A faint procedural nebula dome. The star field itself is always on and brightens here. */
export function DeepField() {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nebulaVertex,
        fragmentShader: nebulaFragment,
        side: THREE.BackSide,
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(THEMES[0].accent) },
          uCool: { value: new THREE.Color('#1a3cff') },
          uWarm: { value: new THREE.Color('#ff9a3c') },
          uFade: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [],
  )
  useEffect(() => () => mat.dispose(), [mat])

  useFade('deep', (fade, t) => {
    if (!mesh.current) return
    mesh.current.visible = fade > 0.005
    mat.uniforms.uFade.value = fade
    mat.uniforms.uTime.value = t
    const { lab } = useWorld.getState()
    mat.uniforms.uColor.value.lerp(tmp.set((THEMES.find((x) => x.id === lab.theme) ?? THEMES[0]).accent), 0.08)
  })

  return (
    <mesh ref={mesh} material={mat} raycast={() => null} renderOrder={-1}>
      <sphereGeometry args={[30, 48, 32]} />
    </mesh>
  )
}
