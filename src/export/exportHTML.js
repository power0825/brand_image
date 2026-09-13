import { directionPalette } from '../services/palette.js'

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function arr(v) {
  return Array.isArray(v) ? v : v ? [v] : []
}

async function toDataURI(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = reject
      fr.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const CSS = `
:root{--bg:#fbf6ec;--panel:#fffdf6;--border:#e6dcc6;--text:#2b2620;--muted:#77695a;--accent:#3f63c7;--ok:#1e7a4e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.6}
.wrap{max-width:880px;margin:0 auto;padding:40px 28px 80px}h1{font-size:28px;margin:0 0 4px;color:#2b2620}
h2{font-size:18px;color:var(--accent);border-bottom:1px solid var(--border);padding-bottom:6px;margin:34px 0 12px}
h3{font-size:15px;margin:18px 0 6px}.logo-badge{display:flex;gap:16px;align-items:center;margin:6px 0 4px}
.logo-badge img{width:96px;height:96px;object-fit:cover;border-radius:10px;border:1px solid var(--border)}
.pal{display:flex;gap:8px;margin:8px 0}.pal>div{flex:1;text-align:center}
.pal .sw{height:34px;border-radius:6px;border:1px solid var(--border)}
.pal .hx{font-size:11px;color:var(--muted);margin-top:4px}
img.hero{max-width:100%;border-radius:10px;border:1px solid var(--border)}
ul{padding-left:20px;margin:4px 0}.do li{color:var(--ok)}.dont li{color:#c04a2e}
pre{background:var(--panel);border:1px solid var(--border);padding:14px;border-radius:10px;white-space:pre-wrap;font-size:13px}
.dna{border:1px solid var(--border);border-radius:8px;padding:12px;margin:8px 0;break-inside:avoid}
`
const PAL_NAMES = ['Primary', 'Secondary', 'Aux 1', 'Aux 2']
const dims = [
  ['color', 'Color'], ['typography', 'Typography'], ['composition', 'Composition'],
  ['lighting', 'Lighting'], ['photography', 'Photography'], ['people', 'People'],
  ['material', 'Material'], ['graphicLanguage', 'Graphic Language'],
]

export async function exportHTML(p) {
  const b = p.brandCore || {}
  const brief = p.visualBrief || {}
  const dir = p.selectedDirection || {}
  const logo = p.selectedLogo || {}
  const rules = p.visualRules || {}
  const pal = directionPalette(dir)
  const dna = rules.visualDNA || {}

  const heroTag = dir.heroImage ? `<img class="hero" src="${(await toDataURI(dir.heroImage)) || dir.heroImage}" alt="Selected direction hero" loading="lazy">` : ''
  const logoTag = logo.image ? `<img src="${(await toDataURI(logo.image)) || logo.image}" alt="Selected logo" loading="lazy">` : ''

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc((b.brandName || 'Brand') + ' — Visual Rules')}</title>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
  <h1>${esc(b.brandName || 'Brand')} — Visual Rules</h1>
  <div style="color:var(--muted)">${esc(b.tagline || 'Brand Visual Workflow demo')}</div>

  ${logoTag ? `<div class="logo-badge">${logoTag}<div>
    <h2 style="border:none;margin:0;padding:0;font-size:16px">Selected Logo</h2>
    <strong>${esc(logo.conceptName || '')}</strong>
    <p style="margin:4px 0 0;color:var(--muted)">${esc(logo.explanation || '')}</p>
  </div></div>` : ''}

  ${rules.summary ? `<h2>01 · Brand Visual Summary</h2><p>${esc(rules.summary)}</p>` : ''}
  ${rules.logoRule ? `<h2>02 · Logo Rules</h2><p>${esc(rules.logoRule)}</p>` : ''}

  ${dir.name ? `<h2>Selected Visual Direction</h2><p><strong>${esc(dir.name)}</strong> — ${esc(dir.coreIdea || '')}</p>${heroTag}` : ''}

  ${pal.length >= 2 ? `<div class="pal">${pal.slice(0, 4).map((h, i) => `<div><div class="sw" style="background:${esc(h)}"></div><div class="hx">${esc(PAL_NAMES[i] || '')} · ${esc(h)}</div></div>`).join('')}</div>` : ''}

  ${Object.keys(dna).length ? `<h2>Visual DNA — 8 dimensions</h2>${dims
    .map(([k, label]) => {
      const dim = dna[k]
      if (!dim) return ''
      return `<div class="dna"><h3>${label}</h3>
        <p style="color:var(--muted);font-style:italic;margin:0 0 6px">${esc(dim.principle || '—')}</p>
        <ul class="do">${arr(dim.do).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <ul class="dont">${arr(dim.dont).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>`
    })
    .join('')}` : ''}

  ${rules.doDont ? `<h2>Overall DO / DON'T</h2><div style="display:flex;gap:24px;flex-wrap:wrap">
    <div style="flex:1;min-width:240px"><ul class="do">${arr(rules.doDont.do).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div style="flex:1;min-width:240px"><ul class="dont">${arr(rules.doDont.dont).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>` : ''}

  <p style="color:var(--muted);font-size:12px;margin-top:40px">Brand Visual Workflow demo · self-contained guide (logo/hero images embedded, palette inline).</p>
</div>
</body>
</html>`

  return html
}