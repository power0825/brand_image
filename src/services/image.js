import { useProject } from '../store'
import { buildDirectionHeroPrompt, buildDirectionImg2ImgPrompt, buildLogoImagePrompt } from '../prompts/imagePrompts'

const DEFAULT_SIZE = '1920x1920' // Ark 硬约束：像素 ≥ 3,686,400

function cfg() {
  return useProject.getState().apiConfig
}
function base() {
  const c = cfg()
  return c.direct ? c.arkBase : '/ark'
}
function authHeaders() {
  const c = cfg()
  const h = { 'Content-Type': 'application/json' }
  if (c.direct && c.imageKey) h.Authorization = `Bearer ${c.imageKey}`
  if (c.accessToken) h['x-access-token'] = c.accessToken
  return h
}

async function generate(prompt, { size = DEFAULT_SIZE, image } = {}) {
  const c = cfg()
  const body = {
    model: c.imageModel,
    prompt,
    size,
    n: 1,
    response_format: 'url',
  }
  // img2img: doubao-seedream accepts an `image` field (base64/data URL) on the same endpoint
  if (image) body.image = image
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 60000)
  try {
    const res = await fetch(`${base()}/images/generations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: ctl.signal,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`Image ${res.status}: ${t.slice(0, 300)}`)
    }
    const d = await res.json()
    const url = d.data && d.data[0] ? d.data[0].url : null
    if (!url) throw new Error('No image url in response')
    return url
  } finally {
    clearTimeout(timer)
  }
}

export async function directionImage(direction, brandCore) {
  const ref = useProject.getState().productImages?.[0]?.dataUrl
  // 有唯一参考产品图：img2img，产品保持可辨，环境按方向重设；失败自动退回纯文生图
  if (ref) {
    try {
      return await generate(buildDirectionImg2ImgPrompt(direction, brandCore), { image: ref })
    } catch {
      /* fall through to plain text2img so one reference-image problem never blocks a direction */
    }
  }
  return generate(buildDirectionHeroPrompt(direction, brandCore))
}

export function logoImage(concept, direction, brandName) {
  return generate(buildLogoImagePrompt(concept, direction, brandName))
}

/**
 * Connection check for the image provider.
 * Sends an intentionally-too-small size: Ark rejects it with the "must be at least 3686400" error
 * at the model layer — proof that auth + routing + model all work, without burning a generation.
 */
export async function testImage() {
  const c = cfg()
  const body = {
    model: c.imageModel,
    prompt: 'test',
    size: '64x64',
    n: 1,
    response_format: 'url',
  }
  const res = await fetch(`${base()}/images/generations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const t = await res.text().catch(() => '')
  if (/3,686,400|3686400|must be at least/i.test(t)) {
    return { ok: true, note: 'Connected · size floor check passed' }
  }
  if (res.ok) {
    return { ok: true, note: 'Connected (unexpectedly accepted — fine)' }
  }
  throw new Error(`Image ${res.status}: ${t.slice(0, 300)}`)
}