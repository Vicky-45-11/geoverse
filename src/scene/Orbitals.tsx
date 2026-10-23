import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { THEMES } from '../lib/content'
import { damp } from '../lib/rig'
import { useWorld } from '../store/world'
import { dustVertex, pointFragment, starVertex } from './shaders/fx'

const tmp = new THREE.Color()
const accentOf = () => (THEMES.find((t) => t.id === useWorld.getState().lab.theme) ?? THEMES[0]).accent

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Illustrative orbital planes: radius (Earth radii), inclination and ascending node, in radians. Not real orbits.
const ORBITS = [
  { r: 1.26, inc: 0.9, node: 0.4 },
  { r: 1.4, inc: 1.5, node: 2.2 },
  { r: 1.6, inc: 0.35, node: 4.0 },
]
const MOON = { r: 3.1, inc: 0.09 }

/** Orbit paths, a constellation of satellites and the Moon (not to scale). Toggled from the Object Lab. */
export function Orbitals({ dust }: { dust: number }) {
  const lines = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Points>(null)
  const moon = useRef<THREE.Mesh>(null)
  const dpr = useThree((s) => s.viewport.dpr)
  const vis = useRef({ ring: 1, dust: 1 })

  const lineMat = useMemo(() => new THREE.MeshBasicMaterial({ color: THEMES[0].accent, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), [])

  const dustGeo = useMemo(() => {
    const rnd = seeded(7)
    const orbit = new Float32Array(dust * 4)
    const node = new Float32Array(dust)
    const seed = new Float32Array(dust)
    for (let i = 0; i < dust; i++) {
      const o = ORBITS[Math.floor(rnd() * ORBITS.length)]
      orbit[i * 4] = o.r
      orbit[i * 4 + 1] = rnd() * Math.PI * 2
      orbit[i * 4 + 2] = o.inc
      orbit[i * 4 + 3] = (0.16 + (1.6 - o.r) * 0.2) * (i % 5 === 0 ? -1 : 1)
      node[i] = o.node
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    // position is unused by the shader but three needs it for the draw range
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dust * 3), 3))
    g.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 4))
    g.setAttribute('aNode', new THREE.BufferAttribute(node, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 5)
    return g
  }, [dust])

  const dustMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 2.4 },
          uPixelRatio: { value: 1 },
          uColor: { value: new THREE.Color('#ffe7c2') },
          uOpacity: { value: 1 },
        },
      }),
    [],
  )

  useEffect(() => () => lineMat.dispose(), [lineMat])
  useEffect(() => () => dustMat.dispose(), [dustMat])
  useEffect(() => () => dustGeo.dispose(), [dustGeo])

  useFrame((state, dt) => {
    const { lab, reducedMotion } = useWorld.getState()
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    vis.current.ring = damp(vis.current.ring, lab.ring ? 1 : 0, 4, dt)
    vis.current.dust = damp(vis.current.dust, lab.particles ? 1 : 0, 4, dt)

    lineMat.opacity = 0.16 * vis.current.ring
    lineMat.color.lerp(tmp.set(accentOf()), 0.08)
    if (lines.current) lines.current.visible = vis.current.ring > 0.01
    if (moon.current) {
      moon.current.visible = vis.current.ring > 0.01
      const a = t * 0.05 + 0.55
      moon.current.position.set(Math.cos(a) * MOON.r, Math.sin(a) * Math.sin(MOON.inc) * MOON.r, Math.sin(a) * MOON.r)
      moon.current.scale.setScalar(vis.current.ring)
    }

    dustMat.uniforms.uTime.value = t
    dustMat.uniforms.uPixelRatio.value = dpr
    dustMat.uniforms.uOpacity.value = vis.current.dust
    if (dustRef.current) dustRef.current.visible = vis.current.dust > 0.01
  })

  return (
    <group>
      <group ref={lines}>
        {ORBITS.map((o, i) => (
          <group key={i} rotation={[o.inc, o.node, 0, 'YXZ']}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={lineMat} raycast={() => null}>
              <ringGeometry args={[o.r - 0.0035, o.r + 0.0035, 160, 1]} />
            </mesh>
          </group>
        ))}
      </group>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} raycast={() => null} />
      <mesh ref={moon} raycast={() => null}>
        <sphereGeometry args={[0.13, 32, 24]} />
        <meshStandardMaterial color="#b9b6b2" roughness={0.95} metalness={0} emissive="#26231f" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

/** Distant star field. Brighter when the Deep Field environment is active. */
export function Stars({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const geo = useMemo(() => {
    const rnd = seeded(31)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const r = 40 + rnd() * 40
      const s = Math.sqrt(1 - u * u)
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3)
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])
  const mat = useMemo(
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
          uSize: { value: 2.2 },
          uColor: { value: new THREE.Color('#d9d4ff') },
          uOpacity: { value: 0.6 },
        },
      }),
    [],
  )
  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])
  const ref = useRef<THREE.Points>(null)
  useFrame((state, dt) => {
    const { env, reducedMotion } = useWorld.getState()
    mat.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime
    mat.uniforms.uPixelRatio.value = dpr
    mat.uniforms.uOpacity.value = damp(mat.uniforms.uOpacity.value, env === 'deep' ? 1 : 0.55, 2, dt)
    if (ref.current && !reducedMotion) ref.current.rotation.y += dt * 0.004
  })
  return <points ref={ref} geometry={geo} material={mat} raycast={() => null} />
}
