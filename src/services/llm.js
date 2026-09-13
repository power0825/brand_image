import { useProject } from '../store'
import { visualBriefPrompt, BRIEF_SCHEMA } from '../prompts/visualBrief'
import { visualDirectionsPrompt } from '../prompts/visualDirections'
import { logoConceptsPrompt } from '../prompts/brandIdentity'
import { visualRulesPrompt } from '../prompts/visualRules'
import { brandCoreFromTextPrompt } from '../prompts/brandCoreParse'

const MAX_TOKENS = 4096

function cfg() {
  return useProject.getState().apiConfig
}

// Mode A -> 同源代理路径；Mode B -> 外网 host
function base() {
  const c = cfg()
  return c.direct ? c.openAiBase : '/v1'
}

function authHeaders() {
  const c = cfg()
  const h = { 'Content-Type': 'application/json' }
  if (c.direct && c.llmKey) h.Authorization = `Bearer ${c.llmKey}`
  if (c.accessToken) h['x-access-token'] = c.accessToken
  return h
}

export function parseJson(raw) {
  if (!raw) throw new Error('Empty response from model')
  const t = String(raw).trim()
  try { return JSON.parse(t) } catch { /* fallthrough */ }
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  const cand = fenced ? fenced[1] : t
  try { return JSON.parse(cand.trim()) } catch { /* fallthrough */ }
  const idx = cand.indexOf('{')
  if (idx >= 0) {
    try { return JSON.parse(cand.slice(idx, cand.lastIndexOf('}') + 1)) } catch { /* fallthrough */ }
  }
  throw new Error('Model did not return valid JSON: ' + t.slice(0, 160))
}

async function request(url, options) {
  try {
    return await fetch(url, options)
  } catch (e) {
    const message = String((e && e.message) || e)
    if (/failed to fetch|networkerror|cors/i.test(message)) {
      throw new Error('Browser direct request was blocked by CORS. Verify the Ark endpoint and browser origin, or switch to Mode A server proxy.')
    }
    throw e
  }
}

export async function chat({ system, user, json = true, maxTokens = MAX_TOKENS }) {
  const c = cfg()
  const body = {
    model: c.textModel,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens,
  }
  if (json) body.response_format = { type: 'json_object' }

  const res = await request(`${base()}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`)
  }
  const data = await res.json()
  const content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : ''
  if (json) return parseJson(content)
  return content
}

function asArr(v) {
  return Array.isArray(v) ? v : v ? [v] : []
}

export async function generateVisualBrief(brandCore) {
  const { system, user } = visualBriefPrompt(brandCore)
  const j = await chat({ system, user })
  const out = {
    brandEssence: j.brandEssence || '',
    desiredPerception: j.desiredPerception || '',
    visualPersonality: j.visualPersonality || '',
    visualKeywords: asArr(j.visualKeywords),
    emotionalKeywords: asArr(j.emotionalKeywords),
    usageScenarios: asArr(j.usageScenarios),
    differentiationCues: asArr(j.differentiationCues),
    avoidList: asArr(j.avoidList),
  }
  return out
}

export async function generateVisualDirections(brandCore, visualBrief) {
  const { system, user } = visualDirectionsPrompt(brandCore, visualBrief)
  const j = await chat({ system, user })
  const list = asArr(j.directions)
  if (list.length < 1) throw new Error('Model returned no directions')
  return list
}

export async function generateLogoConcepts(brandCore, visualBrief, direction) {
  const { system, user } = logoConceptsPrompt(brandCore, visualBrief, direction)
  const j = await chat({ system, user })
  return asArr(j.logoConcepts).map((c, i) => {
    const t = c.type && (c.type === 'wordmark' || c.type === 'combination') ? c.type : i === 0 ? 'wordmark' : 'combination'
    return { ...c, type: t }
  })
}

export async function generateVisualRules(project) {
  const { system, user } = visualRulesPrompt(project)
  const j = await chat({ system, user })
  return j
}

const CORE_KEYS = [
  'brandName', 'purpose', 'promise', 'targetAudience', 'positioning',
  'personality', 'keyDifferentiation', 'usageContext', 'tagline',
]

/** Keep only non-empty Brand Core fields, normalised to strings. */
export function pickCoreFields(obj) {
  if (!obj || typeof obj !== 'object') return {}
  const out = {}
  for (const k of CORE_KEYS) {
    const v = obj[k]
    if (v == null) continue
    let s
    try { s = String(v) } catch { continue }
    if (s.trim()) out[k] = s.trim()
  }
  return out
}

/** Ask the LLM to fill the 9 Brand Core fields from a raw document. */
export async function parseBrandCoreFromText(text) {
  const { system, user } = brandCoreFromTextPrompt(text)
  const j = await chat({ system, user })
  return pickCoreFields(j)
}

/** Lightweight connection check for the LLM endpoint (tiny request). */
export async function testLLM() {
  const c = cfg()
  const body = {
    model: c.textModel,
    messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    max_tokens: 16,
  }
  const res = await request(`${base()}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`)
  }
  const d = await res.json()
  const content = d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : ''
  return (content || 'OK').slice(0, 24)
}

export { BRIEF_SCHEMA }