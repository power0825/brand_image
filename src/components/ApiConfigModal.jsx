import { useState } from 'react'
import { useProject } from '../store'
import { testLLM } from '../services/llm'
import { testImage } from '../services/image'
import { Button, Labelled } from './ui'

export default function ApiConfigModal({ open, onClose }) {
  const apiConfig = useProject((s) => s.apiConfig)
  const setApiConfig = useProject((s) => s.setApiConfig)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState('')
  const [result, setResult] = useState(null)

  if (!open) return null
  const d = draft || apiConfig

  const set = (patch) => setDraft((t) => ({ ...(t || apiConfig), ...patch }))

  async function runTest(which) {
    setBusy(which)
    setResult(null)
    setApiConfig(d) // 保存当前草稿再做测试
    try {
      if (which === 'llm') {
        const out = await testLLM()
        setResult({ which, ok: true, note: `LLM OK — model replied: ${out || '(empty)'}` })
      } else {
        const out = await testImage()
        setResult({ which, ok: true, note: out.note })
      }
    } catch (e) {
      setResult({ which, ok: false, note: e.message })
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Connections — Volcengine Ark (text + image)</h3>
        <div className="row">
          <Labelled label="Text model">
            <input className="input" value={d.textModel} onChange={(e) => set({ textModel: e.target.value })} />
          </Labelled>
          <Labelled label="Image model">
            <input className="input" value={d.imageModel} onChange={(e) => set({ imageModel: e.target.value })} />
          </Labelled>
          <Labelled label="OpenAI-compatible base (text)">
            <input className="input" value={d.openAiBase} onChange={(e) => set({ openAiBase: e.target.value })} />
          </Labelled>
          <Labelled label="Ark base (image)">
            <input className="input" value={d.arkBase} onChange={(e) => set({ arkBase: e.target.value })} />
          </Labelled>
        </div>

        <Labelled label="Transport">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={d.direct}
              onChange={(e) => set({ direct: e.target.checked })}
            />
            Mode B: direct browser calls using each user's own Ark key. Off = Mode A server proxy, keys from .env.local / Vercel env.
          </label>
        </Labelled>

        <Labelled label="Access token (required for the public Vercel proxy — use the same value as DEMO_ACCESS_TOKEN)">
          <input className="input" value={d.accessToken} onChange={(e) => set({ accessToken: e.target.value })} placeholder="" />
        </Labelled>

        <div className="row">
          <Labelled label="LLM key (Mode B only)">
            <input type="password" className="input" value={d.llmKey} onChange={(e) => set({ llmKey: e.target.value })} placeholder="••••" />
          </Labelled>
          <Labelled label="Image key (Mode B only)">
            <input type="password" className="input" value={d.imageKey} onChange={(e) => set({ imageKey: e.target.value })} placeholder="••••" />
          </Labelled>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '6px 0' }}>
          <Button variant="primary" busy={busy === 'llm'} onClick={() => runTest('llm')}>Test text connection</Button>
          <Button variant="primary" busy={busy === 'image'} onClick={() => runTest('image')}>Test image connection</Button>
        </div>

        {result && (
          <div className={result.ok ? 'hint ok' : 'error'} style={{ margin: '0 0 10px' }}>
            {result.note}
          </div>
        )}
        {!d.direct && (
          <p className="hint">
            Mode A active: keys are injected by the dev server from <code>.env.local</code> and never reach the browser.
            API keys are stored only where you put them — do not paste them into the chat.
          </p>
        )}
        {d.direct && (
          <p className="hint" style={{ color: 'var(--warm)' }}>
            Warning (Mode B): keys entered here are saved to this browser's localStorage and sent as headers from the page. Use only on a trusted machine; never publish these keys in a public deployment.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => { setApiConfig(d); onClose() }}>Save</Button>
        </div>
      </div>
    </div>
  )
}