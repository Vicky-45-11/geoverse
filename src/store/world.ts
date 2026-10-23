import { create } from 'zustand'
import type { EnvId, MaterialId, RegionId, SectionId, ThemeId, ViewId } from '../lib/content'
import { REGIONS } from '../lib/content'

export interface LabState {
  material: MaterialId
  theme: ThemeId
  /** key light azimuth, degrees */
  light: number
  /** key light intensity multiplier */
  intensity: number
  ring: boolean
  particles: boolean
  bloom: boolean
  autoRotate: boolean
  view: ViewId
}

export const LAB_DEFAULTS: LabState = {
  material: 'realistic',
  theme: 'violet',
  light: 78,
  intensity: 1,
  ring: true,
  particles: true,
  bloom: true,
  autoRotate: true,
  view: 'orbit',
}

interface WorldState {
  section: SectionId
  region: RegionId | null
  hoverRegion: RegionId | null
  env: EnvId
  lab: LabState
  mobile: boolean
  reducedMotion: boolean
  webgl: boolean
  ready: boolean
  contextLost: boolean
  setSection: (s: SectionId) => void
  selectRegion: (r: RegionId | null) => void
  stepRegion: (dir: 1 | -1) => void
  setHoverRegion: (r: RegionId | null) => void
  setEnv: (e: EnvId) => void
  setLab: (patch: Partial<LabState>) => void
  resetLab: () => void
  set: (patch: Partial<Pick<WorldState, 'mobile' | 'reducedMotion' | 'webgl' | 'ready' | 'contextLost'>>) => void
}

export const useWorld = create<WorldState>((set, get) => ({
  section: 'surface',
  region: null,
  hoverRegion: null,
  env: 'deep',
  lab: { ...LAB_DEFAULTS },
  mobile: false,
  reducedMotion: false,
  webgl: true,
  ready: false,
  contextLost: false,
  setSection: (section) => set({ section }),
  selectRegion: (region) => set({ region }),
  stepRegion: (dir) => {
    const i = REGIONS.findIndex((r) => r.id === get().region)
    const next = i < 0 ? (dir === 1 ? 0 : REGIONS.length - 1) : (i + dir + REGIONS.length) % REGIONS.length
    set({ region: REGIONS[next].id })
  },
  setHoverRegion: (hoverRegion) => set({ hoverRegion }),
  setEnv: (env) => set({ env }),
  setLab: (patch) => set({ lab: { ...get().lab, ...patch } }),
  resetLab: () => set({ lab: { ...LAB_DEFAULTS, bloom: !get().mobile } }),
  set: (patch) => set(patch),
}))
