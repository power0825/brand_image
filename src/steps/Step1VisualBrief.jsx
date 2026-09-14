import { useRef, useState } from 'react'
import { useProject } from '../store'
import { generateVisualBrief, parseBrandCoreFromText, pickCoreFields, BRIEF_SCHEMA } from '../services/llm'
import { extractText } from '../services/documentText'
import { fileToCompressedDataURL, MAX_PRODUCT_IMAGES } from '../services/productImages'
import { Button, ErrorNote, Panel, ChipEditor, Labelled } from '../components/ui'

const CORE_FIELDS = [
  ['brandName', 'Brand Name'],
  ['purpose', 'Brand Purpose'],
  ['promise', 'Brand Promise'],
  ['targetAudience', 'Target Audience'],
  ['positioning', 'Brand Positioning'],
  ['personality', 'Brand Personality'],
  ['keyDifferentiation', 'Key Differentiation'],
  ['usageContext', 'Usage Context'],
  ['tagline', 'Tagline'],
]

export default function Step1VisualBrief() {
  const brandCore = useProject((s) => s.brandCore)
  const storeBrief = useProject((s) => s.visualBrief) // 持久化到 store，切页不丢
  const approved = useProject((s) => s.approved.brief)
  const setBrandCore = useProject((s) => s.setBrandCore)
  const setVisualBrief = useProject((s) => s.setVisualBrief)
  const approveBrief = useProject((s) => s.approveBrief)

  const [core, setCore] = useState(brandCore)
  const [brief, setBrief] = useState(storeBrief) // 从 store 初始化，返回本页时能看到已生成的 brief
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const fileRef = useRef(null)
  const [importState, setImportState] = useState(null) // { busy, ok, msg }
  const productImages = useProject((s) => s.productImages)
  const setProductImages = useProject((s) => s.setProductImages)
  const [imgBusy, setImgBusy] = useState(false)
  const imgRef = useRef(null)

  function patchCore(key, v) {
    setCore((c) => ({ ...c, [key]: v }))
  }

  function patchBrief(key, v) {
    setBrief((b) => ({ ...b, [key]: v }))
  }

  function resetBrief() {
    setBrief(null)
    setVisualBrief(null)
  }

  async function generate() {
    setBusy(true)
    setErr(null)
    try {
      const result = await generateVisualBrief(core)
      setBrief(result)
      setBrandCore(core)
      setVisualBrief(result) // 生成即写入 store，防止切页丢失
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onImportFile(e) {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    setImportState({ busy: true, ok: null, msg: 'Reading file…' })
    setErr(null)
    try {
      const { text, json } = await extractText(f)
      if (json !== undefined && json !== null && typeof json === 'object') {
        const src = json.brandCore && typeof json.brandCore === 'object' ? json.brandCore : json
        const fields = pickCoreFields(src)
        setCore((c) => ({ ...c, ...fields }))
        resetBrief()
        setImportState({
          busy: false,
          ok: true,
          msg: `Filled ${Object.keys(fields).length} of 9 fields from JSON — review and adjust.`,
        })
      } else {
        setImportState({ busy: true, ok: null, msg: 'Asking the AI to read the document…' })
        const fields = await parseBrandCoreFromText(text)
        setCore((c) => ({ ...c, ...fields }))
        resetBrief()
        const n = Object.keys(fields).length
        setImportState({
          busy: false,
          ok: true,
          msg: n ? `AI parsed ${n} of 9 fields — review and adjust.` : 'The AI found no brand fields in this document — check the file content.',
        })
      }
    } catch (e) {
      setErr(e.message)
      setImportState({ busy: false, ok: false, msg: '' })
    }
  }

  async function onAddProductImages(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const remaining = MAX_PRODUCT_IMAGES - productImages.length
    if (remaining <= 0) return
    setImgBusy(true)
    const added = []
    for (const f of files.slice(0, remaining)) {
      try {
        const dataUrl = await fileToCompressedDataURL(f)
        added.push({
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          name: f.name,
          dataUrl,
        })
      } catch {
        /* skip unreadable image */
      }
    }
    setProductImages([...productImages, ...added].slice(0, MAX_PRODUCT_IMAGES))
    setImgBusy(false)
  }

  function removeProductImage(id) {
    setProductImages(productImages.filter((p) => p.id !== id))
  }

  function approve() {
    if (!brief) return
    setBrandCore(core)
    setVisualBrief(brief)
    approveBrief()
  }

  return (
    <>
      {/* 上半区：Brand Core —— 导入与手动编辑 */}
      <Panel
        title="Brand Core — import a file or type it"
        actions={
          <>
            <Button
              className="sm"
              disabled={!!(importState && importState.busy)}
              onClick={() => fileRef.current && fileRef.current.click()}
              title="Import a brand strategy: .docx / .pptx / .txt / .md / .csv / .html are read and the AI fills the fields; .json is used directly."
            >
              {importState && importState.busy ? 'Parsing…' : 'Import file'}
            </Button>
            <span className="hint">supports .docx .pptx .txt .md .csv .html .json</span>
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              accept=".txt,.md,.markdown,.csv,.html,.json,.docx,.pptx,.pdf"
              onChange={onImportFile}
            />
          </>
        }
      >
        <p className="hint" style={{ marginTop: 0 }}>
          Edit any field directly (all 3-line boxes), or import a brand document to auto-fill, then generate the Visual Brief.
        </p>

        <Labelled label="Brand Name">
          <input className="input" value={core.brandName || ''} onChange={(e) => patchCore('brandName', e.target.value)} />
        </Labelled>

        <div className="grid-2">
          {CORE_FIELDS.slice(1).map(([key, label]) => (
            <Labelled key={key} label={label}>
              <textarea className="input" rows={3} value={core[key] || ''} onChange={(e) => patchCore(key, e.target.value)} />
            </Labelled>
          ))}
        </div>

        <Labelled label={`Reference product images (${productImages.length}/${MAX_PRODUCT_IMAGES})`}>
          <div className="chips">
            {productImages.map((p) => (
              <div key={p.id} className="prod-thumb">
                <img src={p.dataUrl} alt="" title={p.name || 'product'} />
                <button type="button" onClick={() => removeProductImage(p.id)}>×</button>
              </div>
            ))}
            <Button
              className="sm ghost"
              disabled={imgBusy || productImages.length >= MAX_PRODUCT_IMAGES}
              onClick={() => imgRef.current && imgRef.current.click()}
            >
              {imgBusy ? 'Processing…' : 'Upload product images'}
            </Button>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={onAddProductImages}
            />
          </div>
        </Labelled>
        <p className="hint" style={{ marginTop: -6 }}>
          Optional. Up to {MAX_PRODUCT_IMAGES} photos of the real product — used as an image-to-image reference when
          generating the Visual Directions in Step 2 (keeps the product recognizable, restyles the scene). Not required.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="primary" busy={busy} onClick={generate}>
            {busy ? 'Analyzing…' : 'Generate Visual Brief'}
          </Button>
        </div>
        {importState && (
          <p
            style={{ margin: '6px 0 0', fontSize: 12.5, textAlign: 'right' }}
            className={importState.busy ? 'hint' : importState.ok === false ? 'error' : 'hint ok'}
          >
            {importState.msg || (importState.ok === false ? 'Import failed — see the message above.' : '')}
          </p>
        )}
      </Panel>

      {/* 下半区：Visual Brief 结果 —— 每字段独占一行 */}
      <Panel
        title="Visual Brief — result"
        actions={brief && (
          <Button className="sm" onClick={generate}>Regenerate</Button>
        )}
        footer={
          brief && (
            <div className="panel-footer-action">
              <Button className="continue-btn" variant="primary" onClick={approve} disabled={!brief || !core.brandName}>
                {approved ? 'Saved ✓' : 'Approve & continue →'}
              </Button>
            </div>
          )
        }
      >
        <ErrorNote>{err}</ErrorNote>

        {!brief && !err ? (
          <div className="hint" style={{ padding: 30, textAlign: 'center' }}>
            {busy ? 'Translating brand strategy into visual meaning…' : 'No brief yet — fill the Brand Core above and generate.'}
          </div>
        ) : (
          brief && (
            <>
              {BRIEF_SCHEMA.fields.map(({ key, label }) => (
                <Labelled key={key} label={label}>
                  <textarea className="input" rows={3} value={brief[key] || ''} onChange={(e) => patchBrief(key, e.target.value)} />
                </Labelled>
              ))}
              {BRIEF_SCHEMA.arrays.map(({ key, label }) => (
                <ChipEditor key={key} label={label} value={brief[key] || []} onChange={(v) => patchBrief(key, v)} />
              ))}
              {approved && <p className="hint ok" style={{ marginBottom: 0 }}>Approved. This brief now drives Step 02.</p>}
            </>
          )
        )}
      </Panel>

      <p className="footer-note">Classroom key point: understand the brand first — no images yet.</p>
    </>
  )
}