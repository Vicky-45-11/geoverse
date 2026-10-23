// Turns dist-artifact/ into one self-contained HTML body (CSS and JS inlined): node scripts/artifact.mjs <out.html>
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const out = process.argv[2] ?? 'dist-artifact/geoverse.html'
const dir = 'dist-artifact/assets'
const files = readdirSync(dir)
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n')
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n')
const favicon = readFileSync('public/favicon.svg', 'utf8')
const html = `<title>GeoVerse</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="GeoVerse: explore beyond the surface. A real-time 3D Earth rendered live in WebGL.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`
writeFileSync(out, html)
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`)
