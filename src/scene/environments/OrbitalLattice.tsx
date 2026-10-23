import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { THEMES } from '../../lib/content'
import { useWorld } from '../../store/world'
import { latticeFragment, latticeVertex, pointFragment, starVertex } from '../shaders/fx'
import { useFade } from './useFade'

const NODES = 96
const LINKS = 3
const tmp = new THREE.Color()

/** Relay nodes on a fibonacci sphere, each linked to its nearest neighbours, with pulses on the links. */
export function OrbitalLattice() {
  const group = useRef<THREE.Group>(null)

  const { lineGeo, nodeGeo } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < NODES; i++) {
      const y = 1 - (i / (NODES - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const rad = 1.52 + Math.sin(i * 12.9898) * 0.1
      pts.push(new THREE.Vector3(Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad))
    }
    const seen = new Set<string>()
    const pos: number[] = []
    const ts: number[] = []
    const seeds: number[] = []
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, LINKS)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) return
          seen.add(key)
          const q = pts[j]
          pos.push(p.x, p.y, p.z, q.x, q.y, q.z)
          ts.push(0, 1)
          const s = (Math.sin(i * 78.233 + j * 12.9898) * 43758.5453) % 1
          seeds.push(Math.abs(s), Math.abs(s))
        })
    })
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    lineGeo.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1))
    lineGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts)
    nodeGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(pts.map((_, i) => (i * 0.618) % 1), 1))
    return { lineGeo, nodeGeo }
  }, [])

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: latticeVertex,
        fragmentShader: latticeFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(THEMES[0].accent) },
          uWarm: { value: new THREE.Color('#ffc06a') },
          uTime: { value: 0 },
          uFade: { value: 0 },
        },
      }),
    [],
  )
  const nodeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 5 },
          uColor: { value: new THREE.Color('#dcd0ff') },
          uOpacity: { value: 0 },
        },
      }),
    [],
  )

  useEffect(
    () => () => {
      lineGeo.dispose()
      nodeGeo.dispose()
      lineMat.dispose()
      nodeMat.dispose()
    },
    [lineGeo, nodeGeo, lineMat, nodeMat],
  )

  useFade('lattice', (fade, t, dt) => {
    const g = group.current
    if (!g) return
    g.visible = fade > 0.005
    if (!g.visible) return
    const { lab } = useWorld.getState()
    lineMat.uniforms.uFade.value = fade
    lineMat.uniforms.uTime.value = t
    lineMat.uniforms.uColor.value.lerp(tmp.set((THEMES.find((x) => x.id === lab.theme) ?? THEMES[0]).accent), 0.08)
    nodeMat.uniforms.uOpacity.value = fade
    nodeMat.uniforms.uTime.value = t
    nodeMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    g.scale.setScalar(1.2 - 0.2 * fade)
    g.rotation.y -= dt * 0.03
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} material={lineMat} raycast={() => null} />
      <points geometry={nodeGeo} material={nodeMat} raycast={() => null} />
    </group>
  )
}
