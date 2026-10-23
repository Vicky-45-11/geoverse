import { advance, Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { rig } from '../lib/rig'
import { useWorld } from '../store/world'
import { World } from './World'

/** measures real frame rate, steps the pixel ratio down when frames run long, and flags the first frame */
function Governor({ maxDpr }: { maxDpr: number }) {
  const setDpr = useThree((s) => s.setDpr)
  const acc = useRef({ t: 0, n: 0, dpr: maxDpr, first: true })
  useFrame((_, dt) => {
    const a = acc.current
    if (a.first) {
      a.first = false
      // let the shaders compile and one frame land before we drop the loader
      requestAnimationFrame(() => useWorld.getState().set({ ready: true }))
    }
    a.t += dt
    a.n++
    if (a.t < 1.5) return
    const fps = a.n / a.t
    rig.fps = fps
    a.t = 0
    a.n = 0
    if (fps < 40 && a.dpr > 1) a.dpr = Math.max(1, a.dpr - 0.25)
    else if (fps > 57 && a.dpr < maxDpr) a.dpr = Math.min(maxDpr, a.dpr + 0.125)
    else return
    rig.dpr = a.dpr
    setDpr(a.dpr)
  })
  return null
}

function ContextWatch() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const lost = (e: Event) => {
      e.preventDefault()
      useWorld.getState().set({ contextLost: true })
    }
    const restored = () => useWorld.getState().set({ contextLost: false })
    el.addEventListener('webglcontextlost', lost)
    el.addEventListener('webglcontextrestored', restored)
    return () => {
      el.removeEventListener('webglcontextlost', lost)
      el.removeEventListener('webglcontextrestored', restored)
    }
  }, [gl])
  return null
}

export default function WorldCanvas() {
  const mobile = useWorld((s) => s.mobile)
  const bloom = useWorld((s) => s.lab.bloom)
  const [visible, setVisible] = useState(!document.hidden)
  // ?capture renders only when a recorder calls __advance(seconds), so videos get exact frame timing
  const capture = new URLSearchParams(window.location.search).has('capture')
  useEffect(() => {
    if (capture) (window as unknown as { __advance: (t: number) => void }).__advance = (t) => advance(t)
  }, [capture])
  const quality = mobile || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'low' : 'high'
  const maxDpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.75 : 1.5)

  useEffect(() => {
    // pause the render loop while the tab is hidden
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <Canvas
      className="world-canvas"
      frameloop={capture || !visible ? 'never' : 'always'}
      dpr={[1, maxDpr]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0, 0.4, 7] }}
      gl={{ antialias: !bloom, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      eventSource={document.getElementById('root')!}
      eventPrefix="client"
      aria-hidden
    >
      <Governor maxDpr={maxDpr} />
      <ContextWatch />
      <World quality={quality} />
      {bloom && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.5} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
