export type SectionId = 'surface' | 'explore' | 'worlds' | 'lab' | 'beyond'

export const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  { id: 'surface', label: 'Surface', short: 'Hero' },
  { id: 'explore', label: 'Explorer', short: 'Map' },
  { id: 'worlds', label: 'Worlds', short: 'Env' },
  { id: 'lab', label: 'Object Lab', short: 'Lab' },
  { id: 'beyond', label: 'Beyond', short: 'End' },
]

export type RegionId = 'himalaya' | 'amazon' | 'sahara' | 'reef' | 'antarctica'

export interface Region {
  id: RegionId
  name: string
  /** degrees; real positions on Earth */
  lat: number
  lon: number
  kicker: string
  body: string
  /** what to look for on the globe */
  trait: string
  glow: string
}

// Real places. The blurbs are short general facts, not live data.
export const REGIONS: Region[] = [
  {
    id: 'himalaya',
    name: 'Himalaya',
    lat: 28,
    lon: 87,
    kicker: 'Mount Everest · Asia',
    body: 'The world\u2019s highest mountains. Everest rises to about 8,849 m above sea level, on the border of Nepal and Tibet.',
    trait: 'Snow-white relief against the Tibetan plateau',
    glow: '#9fc3ff',
  },
  {
    id: 'amazon',
    name: 'Amazon Basin',
    lat: -4,
    lon: -62,
    kicker: 'South America',
    body: 'The largest tropical rainforest on Earth, drained by the Amazon River, which carries more water to the sea than any other river.',
    trait: 'Dense green canopy and a pale river delta',
    glow: '#8fe3b0',
  },
  {
    id: 'sahara',
    name: 'Sahara',
    lat: 24,
    lon: 12,
    kicker: 'North Africa',
    body: 'The largest hot desert, roughly the size of the United States. Look for the sharp colour change where sand meets the Sahel to the south.',
    trait: 'Bright ochre sand, bare of cloud',
    glow: '#ffd36b',
  },
  {
    id: 'reef',
    name: 'Great Barrier Reef',
    lat: -18,
    lon: 148,
    kicker: 'Coral Sea · Australia',
    body: 'The largest coral reef system, stretching more than 2,000 km along the Queensland coast. It is large enough to be seen from space.',
    trait: 'Shallow-water shelf off north-east Australia',
    glow: '#55d6e0',
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    lat: -78,
    lon: 20,
    kicker: 'South Pole',
    body: 'A continent under an ice sheet that holds most of the planet\u2019s fresh water. At the poles the globe looks the way it does because the sun stays low.',
    trait: 'Ice sheet, seen at a grazing angle',
    glow: '#dce8ff',
  },
]

export type EnvId = 'crystal' | 'lattice' | 'deep'

export const ENVIRONMENTS: { id: EnvId; name: string; body: string; detail: string }[] = [
  {
    id: 'deep',
    name: 'Deep Field',
    body: 'Open space around a clear Earth: a procedural nebula and a dense star field.',
    detail: 'Domain-warped nebula dome · twinkling point field',
  },
  {
    id: 'lattice',
    name: 'Orbital Lattice',
    body: 'A luminous relay network hugging the globe, with signal pulses running along every link. Illustrative, not real infrastructure.',
    detail: 'Fibonacci-sphere nodes · nearest-neighbour links · shader pulses',
  },
  {
    id: 'crystal',
    name: 'Crystal Isles',
    body: 'A surreal variation: seven floating islands of faceted crystal in a slow belt around the planet.',
    detail: 'Instanced octahedra · 1 draw call · faceted fresnel shader',
  },
]

export type MaterialId = 'realistic' | 'night' | 'atlas' | 'hologram'

export interface MaterialPreset {
  id: MaterialId
  name: string
  /** shader look weights: real, night side, atlas, hologram */
  night: number
  atlas: number
  holo: number
  swatch: [string, string]
}

export const MATERIALS: MaterialPreset[] = [
  { id: 'realistic', name: 'Realistic', night: 0, atlas: 0, holo: 0, swatch: ['#1b4f9c', '#6fa24a'] },
  { id: 'night', name: 'Night lights', night: 1, atlas: 0, holo: 0, swatch: ['#050816', '#ffbf5e'] },
  { id: 'atlas', name: 'Atlas', night: 0, atlas: 1, holo: 0, swatch: ['#0c2145', '#d79a52'] },
  { id: 'hologram', name: 'Hologram', night: 0, atlas: 0, holo: 1, swatch: ['#02101f', '#6fd3ff'] },
]

export type ThemeId = 'violet' | 'electric' | 'amber'

export const THEMES: { id: ThemeId; name: string; accent: string; soft: string }[] = [
  { id: 'violet', name: 'Violet', accent: '#a978ff', soft: '#5d2fb3' },
  { id: 'electric', name: 'Electric', accent: '#4f9bff', soft: '#1d4fb8' },
  { id: 'amber', name: 'Amber', accent: '#ffb14f', soft: '#a8581a' },
]

export type ViewId = 'orbit' | 'polar' | 'close'

export const VIEWS: { id: ViewId; name: string }[] = [
  { id: 'orbit', name: 'Orbit' },
  { id: 'polar', name: 'Polar' },
  { id: 'close', name: 'Close-up' },
]
