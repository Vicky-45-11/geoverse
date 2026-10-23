import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { THEMES } from '../../lib/content'
import { useWorld } from '../../store/world'
import { lightDirection } from '../lighting'
import { crystalFragment, crystalVertex } from '../shaders/fx'
import { useFade } from './useFade'

const ISLANDS = 7
const PER_ISLAND = 11
const tmp = new THREE.Color()

/** Seven floating clusters of crystal. One InstancedMesh, so one draw call for all of them. */
export function CrystalIsles() {
  const group = useRef<THREE.Group>(null)
  const count = ISLANDS * PER_ISLAND

  const geo = useMemo(() => {
    const g = new THREE.OctahedronGeometry(0.075, 0)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) seeds[i] = Math.random()
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    return g
  }, [count])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: crystalVertex,
        fragmentShader: crystalFragment,
        uniforms: {
          uColor: { value: new THREE.Color(THEMES[0].accent) },
          uWarm: { value: new THREE.Color('#ffb14f') },
          uLightDir: { value: new THREE.Vector3(1, 0.4, 0.5) },
          uFade: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [],
  )

  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, count)
    const o = new THREE.Object3D()
    let n = 0
    for (let i = 0; i < ISLANDS; i++) {
      const a = (i / ISLANDS) * Math.PI * 2 + Math.random() * 0.3
      const r = 2.6 + Math.random() * 0.7
      const cx = Math.cos(a) * r
      const cz = Math.sin(a) * r
      const cy = (Math.random() - 0.5) * 0.9
      for (let j = 0; j < PER_ISLAND; j++) {
        const big = j === 0
        o.position.set(cx + (Math.random() - 0.5) * 0.5, cy + (Math.random() - 0.5) * 0.3, cz + (Math.random() - 0.5) * 0.5)
        o.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * Math.PI, (Math.random() - 0.5) * 0.6)
        const s = big ? 1.5 : 0.45 + Math.random() * 0.7
        o.scale.set(s, s * (1.5 + Math.random() * 1.3), s)
        o.updateMatrix()
        m.setMatrixAt(n++, o.matrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
    m.frustumCulled = false
    m.raycast = () => null
    return m
  }, [geo, mat, count])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
      mesh.dispose()
    },
    [geo, mat, mesh],
  )

  useFade('crystal', (fade, t, dt) => {
    const g = group.current
    if (!g) return
    g.visible = fade > 0.005
    if (!g.visible) return
    const { lab } = useWorld.getState()
    mat.uniforms.uFade.value = fade
    mat.uniforms.uTime.value = t
    mat.uniforms.uLightDir.value.copy(lightDirection(lab.light))
    mat.uniforms.uColor.value.lerp(tmp.set((THEMES.find((x) => x.id === lab.theme) ?? THEMES[0]).accent), 0.08)
    g.scale.setScalar(0.6 + 0.4 * fade)
    g.position.y = (1 - fade) * -0.8
    g.rotation.y += dt * 0.05
  })

  return (
    <group ref={group}>
      <primitive object={mesh} />
    </group>
  )
}
