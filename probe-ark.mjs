// 火山方舟 Ark 生图最小验证（key 从 .env.local 读取，不外泄）
import { readFileSync } from 'node:fs'

const ARK = 'https://ark.cn-beijing.volces.com/api/v3'
const MODEL = 'doubao-seedream-4-5-251128'

const env = readFileSync('D:/杭州傲杭/系统开发/brand image/.env.local', 'utf8')
const line = env.split(/\r?\n/).find((l) => l.startsWith('ARK_IMAGE_API_KEY='))
const KEY = (line ? line.slice('ARK_IMAGE_API_KEY='.length) : '').trim().replace(/^['"]|['"]$/g, '')
const mask = (s) => (typeof s === 'string' ? s.split(KEY).join('ark-key-***') : s)

if (!KEY) { console.error('ARK_IMAGE_API_KEY 未在 .env.local 中设置'); process.exit(1) }

const body = {
  model: MODEL,
  prompt: 'flat illustration, a single warm mug on a wooden table, soft morning light, calm beige palette',
  size: '1920x1920',
  n: 1,
  response_format: 'url',
}

try {
  const res = await fetch(`${ARK}/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  })
  const raw = await res.text()
  console.log(`HTTP ${res.status}`)
  console.log(mask(raw).slice(0, 800))
  if (res.status >= 200 && res.status < 300) {
    const data = JSON.parse(raw)?.data || []
    console.log('\nSUCCESS urls:', data.map((d) => d.url || d.b64_json ? 'b64_json present' : '?').join('\n'))
  }
} catch (e) {
  console.log('network error:', e.message)
}