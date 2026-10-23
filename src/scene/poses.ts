import type { SectionId, ViewId } from '../lib/content'

type V3 = [number, number, number]

export interface Pose {
  anchor: V3
  scale: number
  cam: V3
  look: V3
}

/**
 * Where the planet sits and where the camera looks for each section. Positions are absolute.
 * On narrow screens panels sit below the planet, so the look target drops and the planet rises.
 */
export function poseFor(section: SectionId, opts: { mobile: boolean; aspect: number; region: boolean; view: ViewId }): Pose {
  const { mobile, aspect, region, view } = opts
  const far = aspect < 1 ? Math.pow(1.25 / aspect, 0.75) : 1
  const z = (d: number) => d * far

  switch (section) {
    case 'surface':
      return mobile
        ? { anchor: [0, 0, 0], scale: 1, cam: [0, -0.75, z(4.4)], look: [0, -0.75, 0] }
        : { anchor: [1.6, -0.05, 0], scale: 1.05, cam: [0, 0.05, 4.3], look: [0, 0, 0] }
    case 'explore':
      if (region) {
        // the selected region has been rotated to face +z, so frame it off-centre beside the panel
        return mobile
          ? { anchor: [0, 0, 0], scale: 1, cam: [0, -0.62, z(2.35)], look: [0, -0.62, 0] }
          : { anchor: [0.9, 0, 0], scale: 1, cam: [0.35, 0.12, 2.95], look: [0.35, 0.05, 0] }
      }
      return mobile
        ? { anchor: [0, 0, 0], scale: 1, cam: [0, -0.95, z(4.4)], look: [0, -0.95, 0] }
        : { anchor: [0.95, 0, 0], scale: 1, cam: [0, 0.18, 4.4], look: [0, 0, 0] }
    case 'worlds':
      return mobile
        ? { anchor: [0, 0, 0], scale: 0.8, cam: [0, 1.4, z(8.8)], look: [0, -1.3, 0] }
        : { anchor: [0.6, 0, 0], scale: 0.85, cam: [-0.4, 1.7, 7.6], look: [-0.4, 0, 0] }
    case 'lab': {
      const base: V3 = mobile ? [0, 0, 0] : [-1.0, 0, 0]
      const off = mobile ? 0 : 1.0
      const drop = mobile ? -1.05 : 0
      if (view === 'polar') return { anchor: base, scale: 1, cam: [base[0] + off * 0.8, 3.6 + drop, z(1.3)], look: [base[0] + off * 0.6, drop * 0.7, 0] }
      if (view === 'close') return { anchor: base, scale: 1, cam: [base[0] + off * 0.8, 0.3 + drop * 0.6, z(2.9)], look: [base[0] + off * 0.8, 0.15 + drop * 0.6, 0] }
      return { anchor: base, scale: 1, cam: [base[0] + off, 0.18 + drop, z(4.1)], look: [base[0] + off, drop, 0] }
    }
    case 'beyond':
      return mobile
        ? { anchor: [0, 0, 0], scale: 1.1, cam: [0, -0.6, z(6.4)], look: [0, 2.6, 0] }
        : { anchor: [0, 0, 0], scale: 1.15, cam: [0, -0.9, 6.8], look: [0, 1.55, 0] }
  }
}
