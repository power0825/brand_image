import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mode A「本地代理」：浏览器只请求同源 /v1 与 /ark，
// 密钥从 .env.local 在 Node 侧读取并注入请求头，绝不打进前端 bundle。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' -> 读取所有变量（含非 VITE_ 前缀）
  const arkTextKey = env.ARK_TEXT_API_KEY || env.ARK_IMAGE_API_KEY || env.DASHSCOPE_API_KEY || ''
  const arkKey = env.ARK_IMAGE_API_KEY || ''

  const inject = (key) => ({
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (!key) return
        proxyReq.setHeader('Authorization', `Bearer ${key}`)
      })
    },
  })

  const proxy = {
    // 文生本 → 火山方舟 Ark OpenAI 兼容：/v1/chat/completions -> {openAiBase}/chat/completions
    '/v1': {
      target: 'https://ark.cn-beijing.volces.com/api/v3',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/v1/, ''),
      ...inject(arkTextKey),
    },
    // 生图 → 火山方舟 Ark：/ark/images/generations -> {arkBase}/images/generations
    '/ark': {
      target: 'https://ark.cn-beijing.volces.com/api/v3',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/ark/, ''),
      ...inject(arkKey),
    },
  }

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})