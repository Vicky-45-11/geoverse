// Screenshot tour: node scripts/shots.mjs <url> <outDir> [width] [height] [prefix]
// Scrolls to each section, optionally runs a store action, and captures a frame.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const [url = 'http://127.0.0.1:5173/', out = 'screenshots', w = '1440', h = '900', prefix = 'desktop'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const mobile = +w < 760
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForFunction(() => window.__world?.getState().ready, null, { timeout: 60000 })
await page.waitForTimeout(3500)

const go = async (id, name, action = '', wait = 4500) => {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), id)
  if (action) await page.evaluate(action)
  await page.waitForTimeout(wait)
  await page.screenshot({ path: `${out}/${prefix}-${name}.png` })
}
await page.screenshot({ path: `${out}/${prefix}-01-surface.png` })
await go('explore', '02-explore')
await go('explore', '03-region', "window.__world.getState().selectRegion('himalaya')")
await go('worlds', '04-crystal', "window.__world.getState().setEnv('lattice')")
await go('worlds', '05-lattice', "window.__world.getState().setEnv('lattice')")
await go('lab', '06-lab', "window.__world.getState().setLab({ material: 'night', theme: 'electric' })")
await go('lab', '07-lab-holo', "window.__world.getState().setLab({ material: 'hologram', view: 'close' })")
await go('beyond', '08-beyond', "window.__world.getState().resetLab(); window.__world.getState().setEnv('deep')")
console.log(logs.filter((l) => !l.includes('React DevTools')).join('\n') || 'no console output')
await browser.close()
