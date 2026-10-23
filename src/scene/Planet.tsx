import { useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { forwardRef, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MATERIALS, REGIONS, THEMES } from '../lib/content'
import { damp, latLonToVec } from '../lib/rig'
import { useWorld } from '../store/world'
import { atmosphereFragment, atmosphereVertex, cloudFragment, planetFragment, planetVertex } from './shaders/planet'
import cloudsUrl from '../assets/earth/clouds.jpg'
import dayUrl from '../assets/earth/day.jpg'
import lightsUrl from '../assets/earth/lights.jpg'
import normalUrl from '../assets/earth/normal.jpg'
import oceanUrl from '../assets/earth/ocean.jpg'
import { lightDirection } from './lighting'

const tmp = new THREE.Color()
const tmp2 = new THREE.Color()
const EARTH_BLUE = new THREE.Color('#4c8dff')

const TEXTURES = [dayUrl, normalUrl, oceanUrl, lightsUrl, cloudsUrl]

/** The Earth: textured shader surface, drifting cloud layer, atmosphere shell and region hotspots. Lives inside the spin group. */
export const Planet = forwardRef<THREE.Group, { detail: number }>(function Planet({ detail }, ref) {
  const gl = useThree((s) => s.gl)
  const [day, normal, ocean, lights, clouds] = useLoader(THREE.TextureLoader, TEXTURES)

  useMemo(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    for (const t of [day, normal, ocean, lights, clouds]) {
      t.wrapS = THREE.RepeatWrapping
      t.anisotropy = aniso
      t.needsUpdate = true
    }
    day.colorSpace = THREE.SRGBColorSpace
    lights.colorSpace = THREE.NoColorSpace
  }, [gl, day, normal, ocean, lights, clouds])

  const surface = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
        uniforms: {
          uDay: { value: day },
          uNormal: { value: normal },
          uOcean: { value: ocean },
          uLights: { value: lights },
          uTime: { value: 0 },
          uAccent: { value: new THREE.Color(THEMES[0].accent) },
          uNight: { value: 0 },
          uAtlas: { value: 0 },
          uHolo: { value: 0 },
          uLightDir: { value: new THREE.Vector3(1, 0.4, 0.6) },
          uLight: { value: 1 },
          uFocusDir: { value: new THREE.Vector3(0, 0, 1) },
          uFocusColor: { value: new THREE.Color('#ffb35c') },
          uFocus: { value: 0 },
          uHoverDir: { value: new THREE.Vector3(0, 0, 1) },
          uHover: { value: 0 },
        },
      }),
    [day, normal, ocean, lights],
  )
  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uClouds: { value: clouds },
          uLightDir: { value: new THREE.Vector3(1, 0.4, 0.6) },
          uLight: { value: 1 },
          uNight: { value: 0 },
          uOpacity: { value: 0.85 },
        },
      }),
    [clouds],
  )
  const atmo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: EARTH_BLUE.clone() },
          uWarm: { value: new THREE.Color('#ffb98a') },
          uLightDir: { value: new THREE.Vector3(1, 0.4, 0.6) },
          uStrength: { value: 1.0 },
        },
      }),
    [],
  )
  useEffect(() => () => surface.dispose(), [surface])
  useEffect(() => () => cloudMat.dispose(), [cloudMat])
  useEffect(() => () => atmo.dispose(), [atmo])
  useEffect(
    () => () => {
      for (const t of [day, normal, ocean, lights, clouds]) t.dispose()
    },
    [day, normal, ocean, lights, clouds],
  )

  const hover = useRef(0)
  const cloudRef = useRef<THREE.Mesh>(null)

  useFrame((state, dt) => {
    const { lab, region, section, reducedMotion } = useWorld.getState()
    const m = MATERIALS.find((x) => x.id === lab.material) ?? MATERIALS[0]
    const theme = THEMES.find((x) => x.id === lab.theme) ?? THEMES[0]
    const u = surface.uniforms
    const k = 1 - Math.exp(-(reducedMotion ? 20 : 3.2) * dt)
    const time = reducedMotion ? 12 : state.clock.elapsedTime
    u.uTime.value = time
    u.uAccent.value.lerp(tmp.set(theme.accent), k)
    u.uNight.value += (m.night - u.uNight.value) * k
    u.uAtlas.value += (m.atlas - u.uAtlas.value) * k
    u.uHolo.value += (m.holo - u.uHolo.value) * k
    u.uLight.value += (lab.intensity - u.uLight.value) * k
    u.uLightDir.value.copy(lightDirection(lab.light))
    atmo.uniforms.uLightDir.value.copy(u.uLightDir.value)

    // clouds: lit like the surface, hidden in the atlas and hologram looks, and they drift a little faster than the ground
    const cu = cloudMat.uniforms
    cu.uLightDir.value.copy(u.uLightDir.value)
    cu.uLight.value = u.uLight.value
    cu.uNight.value = u.uNight.value
    cu.uOpacity.value = 0.7 * (1 - u.uAtlas.value) * (1 - u.uHolo.value)
    if (cloudRef.current) {
      cloudRef.current.visible = cu.uOpacity.value > 0.01
      if (!reducedMotion) cloudRef.current.rotation.y += dt * 0.004
    }

    const r = region ? REGIONS.find((x) => x.id === region) : null
    const focusTarget = r && section === 'explore' ? 1 : 0
    if (r) {
      u.uFocusDir.value.set(...latLonToVec(r.lat, r.lon))
      u.uFocusColor.value.lerp(tmp.set(r.glow), k)
    }
    u.uFocus.value = damp(u.uFocus.value, focusTarget, 4, dt)
    u.uHover.value = damp(u.uHover.value, hover.current, 6, dt)

    // the halo is Earth blue, nudged toward the chosen theme
    const atmoTarget = tmp.copy(EARTH_BLUE).lerp(tmp2.set(theme.accent), m.holo ? 0.9 : 0.28)
    atmo.uniforms.uColor.value.lerp(atmoTarget, k)
    atmo.uniforms.uStrength.value = damp(atmo.uniforms.uStrength.value, m.holo ? 0.7 : 0.8, 3, dt)
  })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType !== 'mouse') return
    const local = e.object.worldToLocal(e.point.clone()).normalize()
    surface.uniforms.uHoverDir.value.copy(local)
    hover.current = 1
  }

  return (
    <group ref={ref}>
      <mesh material={surface} onPointerMove={onMove} onPointerOut={() => (hover.current = 0)}>
        <sphereGeometry args={[1, detail, Math.round(detail * 0.75)]} />
      </mesh>
      <mesh ref={cloudRef} material={cloudMat} scale={1.006} raycast={() => null}>
        <sphereGeometry args={[1, detail, Math.round(detail * 0.75)]} />
      </mesh>
      <Hotspots />
      <mesh material={atmo} scale={1.1} raycast={() => null}>
        <sphereGeometry args={[1, 48, 32]} />
      </mesh>
    </group>
  )
})

function Hotspots() {
  const group = useRef<THREE.Group>(null)
  const items = useMemo(
    () =>
      REGIONS.map((r) => {
        const n = new THREE.Vector3(...latLonToVec(r.lat, r.lon))
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n)
        return { r, pos: n.clone().multiplyScalar(1.012), q }
      }),
    [],
  )
  const scales = useRef(REGIONS.map(() => 0))

  useFrame((state, dt) => {
    const { section, region, hoverRegion } = useWorld.getState()
    const g = group.current
    if (!g) return
    g.children.forEach((child, i) => {
      const id = REGIONS[i].id
      const target = section === 'explore' ? (region === id ? 1.15 : hoverRegion === id ? 1.3 : 1) : 0
      scales.current[i] = damp(scales.current[i], target, 6, dt)
      const s = scales.current[i]
      child.visible = s > 0.01
      child.scale.setScalar(s * (1 + 0.08 * Math.sin(state.clock.elapsedTime * 2.4 + i)))
    })
  })

  return (
    <group ref={group}>
      {items.map(({ r, pos, q }) => (
        <group
          key={r.id}
          position={pos}
          quaternion={q}
          onClick={(e) => {
            if (e.delta > 6) return
            e.stopPropagation()
            useWorld.getState().selectRegion(r.id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            useWorld.getState().setHoverRegion(r.id)
          }}
          onPointerOut={() => useWorld.getState().setHoverRegion(null)}
        >
          <mesh>
            <ringGeometry args={[0.045, 0.058, 40]} />
            <meshBasicMaterial color={r.glow} toneMapped={false} transparent opacity={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.018, 20]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          {/* larger invisible target so the marker is easy to hit */}
          <mesh>
            <circleGeometry args={[0.11, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
