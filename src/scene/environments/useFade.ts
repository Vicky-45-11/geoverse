import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { EnvId } from '../../lib/content'
import { damp } from '../../lib/rig'
import { useWorld } from '../../store/world'

/** eases 0..1 as an environment becomes active, and reports the value every frame */
export function useFade(id: EnvId, onFrame: (fade: number, time: number, dt: number) => void) {
  const fade = useRef(useWorld.getState().env === id ? 1 : 0)
  useFrame((state, dt) => {
    const { env, reducedMotion } = useWorld.getState()
    fade.current = damp(fade.current, env === id ? 1 : 0, reducedMotion ? 30 : 2.4, dt)
    onFrame(fade.current, reducedMotion ? 0 : state.clock.elapsedTime, dt)
  })
}
