import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { REGIONS } from '../lib/content'
import { angleDelta, damp, rig } from '../lib/rig'
import { useWorld } from '../store/world'
import { CrystalIsles } from './environments/CrystalIsles'
import { DeepField } from './environments/DeepField'
import { OrbitalLattice } from './environments/OrbitalLattice'
import { lightDirection } from './lighting'
import { Orbitals, Stars } from './Orbitals'
import { Planet } from './Planet'
import { poseFor } from './poses'

const look = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const camTarget = new THREE.Vector3()
const v = new THREE.Vector3()
const q = new THREE.Quaternion()

/** Everything in the scene, plus the single per-frame choreography for camera, planet and spin. */
export function World({ quality }: { quality: 'high' | 'low' }) {
  const anchor = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const camera = useThree((s) => s.camera)
  const started = useRef(false)

  useFrame((state, dt) => {
    const a = anchor.current
    const s = spin.current
    if (!a || !s) return
    dt = Math.min(dt, 0.1)
    const { section, region, lab, mobile, reducedMotion } = useWorld.getState()
    const aspect = state.size.width / Math.max(1, state.size.height)
    const regionActive = section === 'explore' && !!region
    const pose = poseFor(section, { mobile, aspect, region: regionActive, view: lab.view })
    const speed = reducedMotion ? 12 : 2.1

    // planet placement, with a gentle push-in while scrolling through the hero
    const heroScale = section === 'surface' ? 1 + rig.hero * 0.18 : 1
    a.position.x = damp(a.position.x, pose.anchor[0], speed, dt)
    a.position.y = damp(a.position.y, pose.anchor[1] - (section === 'surface' ? rig.hero * 0.25 : 0), speed, dt)
    a.position.z = damp(a.position.z, pose.anchor[2], speed, dt)
    a.scale.setScalar(damp(a.scale.x, pose.scale * heroScale, speed, dt))

    // spin: drag inertia, idle rotation, or turn the selected region toward the camera
    if (regionActive) {
      const r = REGIONS.find((x) => x.id === region)!
      const tx = (r.lat * Math.PI) / 180
      const ty = (-r.lon * Math.PI) / 180
      s.rotation.x += angleDelta(s.rotation.x, tx) * (1 - Math.exp(-speed * 1.3 * dt))
      s.rotation.y += angleDelta(s.rotation.y, ty) * (1 - Math.exp(-speed * 1.3 * dt))
      rig.spin.x = rig.spin.y = 0
    } else {
      const idle = lab.autoRotate && !reducedMotion && !rig.dragging ? 0.09 * dt : 0
      s.rotation.y += idle + rig.spin.x
      s.rotation.x = THREE.MathUtils.clamp(s.rotation.x + rig.spin.y, -1.1, 1.1)
      if (!rig.dragging) {
        rig.spin.x *= Math.exp(-3 * dt)
        rig.spin.y *= Math.exp(-3 * dt)
        s.rotation.x = damp(s.rotation.x, 0.18, 0.6, dt)
      }
    }

    // camera: eased toward the section pose, with a little pointer parallax on desktop
    const par = reducedMotion || mobile ? 0 : 1
    camTarget.set(pose.cam[0] + rig.pointer.x * 0.22 * par, pose.cam[1] + rig.pointer.y * 0.14 * par, pose.cam[2])
    lookTarget.set(...pose.look)
    if (!started.current) {
      camera.position.copy(camTarget).add(v.set(0, 0.4, 2.5))
      look.copy(lookTarget)
      started.current = true
    }
    camera.position.x = damp(camera.position.x, camTarget.x, speed, dt)
    camera.position.y = damp(camera.position.y, camTarget.y, speed, dt)
    camera.position.z = damp(camera.position.z, camTarget.z, speed, dt)
    look.x = damp(look.x, lookTarget.x, speed, dt)
    look.y = damp(look.y, lookTarget.y, speed, dt)
    look.z = damp(look.z, lookTarget.z, speed, dt)
    camera.lookAt(look)

    // key light follows the lab's azimuth slider
    if (key.current) {
      key.current.position.copy(lightDirection(lab.light)).multiplyScalar(8)
      key.current.intensity = 2.2 * lab.intensity
    }

    // readout: which latitude / longitude currently faces the camera
    v.copy(camera.position).sub(a.position).normalize()
    s.getWorldQuaternion(q).invert()
    v.applyQuaternion(q)
    rig.facing.lat = (Math.asin(THREE.MathUtils.clamp(v.y, -1, 1)) * 180) / Math.PI
    rig.facing.lon = (Math.atan2(v.x, v.z) * 180) / Math.PI
  })

  return (
    <>
      <ambientLight intensity={0.15} color="#8d7bff" />
      <directionalLight ref={key} intensity={2.2} color="#fff1dd" />
      <Stars count={quality === 'high' ? 1800 : 800} />
      <DeepField />
      <group ref={anchor}>
        <group ref={spin} rotation={[0.3, 1.75, 0]}>
          <Planet detail={quality === 'high' ? 160 : 96} />
        </group>
        <Orbitals dust={quality === 'high' ? 1400 : 600} />
        <CrystalIsles />
        <OrbitalLattice />
      </group>
    </>
  )
}
