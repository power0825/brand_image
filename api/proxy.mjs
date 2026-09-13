/**
 * Vercel Serverless proxy (Mode A in production).
 * The browser only calls same-origin /v1 and /ark; this function reads the API keys
 * from Vercel project environment variables and injects them as headers.
 * Keys therefore never reach the client bundle or the browser.
 *
 * Uses only the raw Node http res API (writeHead/end) so it works identically
 * on Vercel and in plain local Node.
 */
const UPSTREAMS = {
  llm: {
    base: process.env.OPENAI_BASE_URL || 'https://ws-45mqrzn3org3r0jc.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
    key: process.env.DASHSCOPE_API_KEY || '',
  },
  image: {
    base: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    key: process.env.ARK_IMAGE_API_KEY || '',
  },
}

const DEMO_TOKEN = process.env.DEMO_ACCESS_TOKEN || ''

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,Content-Length,x-access-token',
    })
    res.end()
    return
  }

  const kind = req.query && req.query.kind
  const path = ((req.query && req.query.p) || '').replace(/^\/+/, '')
  const upstream = UPSTREAMS[kind]
  if (!upstream) {
    return json(res, 400, { error: 'unknown proxy kind' })
  }

  // Optional shared access token guard: if DEMO_ACCESS_TOKEN is set, requests must carry it.
  const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '')
  if (DEMO_TOKEN && bearer !== DEMO_TOKEN && (req.headers['x-access-token'] || '') !== DEMO_TOKEN) {
    return json(res, 401, { error: 'unauthorized: missing or wrong access token' })
  }

  const url = `${upstream.base}/${path}`
  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    Authorization: `Bearer ${upstream.key}`,
  }

  // forward the raw request body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks)

  try {
    const upstreamRes = await fetch(url, {
      method: req.method || 'POST',
      headers,
      body: body.length ? body : undefined,
    })
    const text = await upstreamRes.text()
    res.writeHead(upstreamRes.status, {
      'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
    })
    res.end(text)
  } catch (e) {
    json(res, 502, { error: 'proxy upstream error: ' + String((e && e.message) || e) })
  }
}