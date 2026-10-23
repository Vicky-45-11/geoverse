// Frame-accurate tour recording: node scripts/record.mjs <url> <framesDir> [width] [height] [fps]
// Loads the site with ?capture so the render loop only advances when told to, then scripts
// scrolling and real store actions over a timeline and saves one PNG per frame.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const [url = 'http://127.0.0.1:5173/?capture', out = 'frames', w = '1280', h = '720', fpsArg = '25'] = process.argv.slice(2)
const FPS = +fpsArg
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForFunction(() => typeof window.__advance === 'function', null, { timeout: 60000 })
await page.evaluate(() => window.__advance(0))
await page.waitForFunction(() => window.__world.getState().ready, null, { timeout: 60000 })
await page.waitForTimeout(1500) // loader fade

const tops = await page.evaluate(() =>
  Object.fromEntries(['surface', 'explore', 'worlds', 'lab', 'beyond'].map((id) => [id, document.getElementById(id).offsetTop])),
)
tops.interlude = await page.evaluate(() => document.querySelector('.interlude').offsetTop + 40)

// scroll keyframes: [time, y]
const S = [
  [0, 0], [4, 0], [5.6, tops.interlude], [7, tops.interlude], [8.6, tops.explore],
  [16.4, tops.explore], [18, tops.worlds], [24, tops.worlds], [25.6, tops.lab],
  [34, tops.lab], [36, tops.beyond], [99, tops.beyond],
]
// store actions: [time, js]
const A = [
  [9.2, "s.selectRegion('amazon')"],
  [11.6, "s.selectRegion('himalaya')"],
  [14, "s.selectRegion('antarctica')"],
  [16, 's.selectRegion(null)'],
  [18.6, "s.setEnv('lattice')"],
  [21.1, "s.setEnv('crystal')"],
  [23.4, "s.setEnv('deep')"],
  [26.2, "s.setLab({ material: 'night' })"],
  [28, "s.setLab({ material: 'atlas' })"],
  [29.8, "s.setLab({ material: 'hologram', theme: 'electric', view: 'close' })"],
  [31.4, "s.setLab({ material: 'realistic', theme: 'violet', view: 'orbit', light: 160 })"],
  [33.2, 's.resetLab()'],
]
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const scrollAt = (t) => {
  for (let i = 0; i < S.length - 1; i++) {
    const [t0, y0] = S[i]
    const [t1, y1] = S[i + 1]
    if (t >= t0 && t <= t1) return y0 + (y1 - y0) * ease((t - t0) / (t1 - t0))
  }
  return S[S.length - 1][1]
}
const DURATION = 39.5
const frames = Math.round(DURATION * FPS)
let next = 0
const t0 = Date.now()
for (let f = 0; f < frames; f++) {
  const t = f / FPS
  const acts = []
  while (next < A.length && A[next][0] <= t) acts.push(A[next++][1])
  // a short "drag" on the hero so the spin is visible
  const spin = t > 1.4 && t < 2.6 ? 0.03 : 0
  await page.evaluate(
    ({ t, y, acts, spin }) => {
      window.scrollTo(0, y)
      const s = window.__world.getState()
      for (const a of acts) new Function('s', a)(s)
      if (spin) window.__rig.spin.x = spin
      window.__rig.pointer.x = Math.sin(t * 0.5) * 0.5
      window.__rig.pointer.y = Math.cos(t * 0.4) * 0.3
      return new Promise((r) => requestAnimationFrame(() => r()))
    },
    { t, y: scrollAt(t), acts, spin },
  )
  await page.evaluate((t) => window.__advance(t + 0.001), t)
  await page.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.png` })
  if (f % 50 === 0) console.log(`frame ${f}/${frames} · ${((Date.now() - t0) / 1000).toFixed(0)}s`)
}
await browser.close()
console.log('done', frames)
