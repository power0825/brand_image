import { useState } from 'react'
import { useProject } from '../store'
import { generateVisualRules } from '../services/llm'
import { directionPalette } from '../services/palette'
import { exportMarkdown } from '../export/exportMarkdown'
import { exportHTML } from '../export/exportHTML'
import { download } from '../export/download'
import { Button, ErrorNote, Panel, ListBlock } from '../components/ui'

const DNA_LABELS = {
  color: 'Color',
  typography: 'Typography',
  composition: 'Composition',
  lighting: 'Lighting',
  photography: 'Photography',
  people: 'People',
  material: 'Material',
  graphicLanguage: 'Graphic Language',
}
const DNA_KEYS = Object.keys(DNA_LABELS)
const PAL_NAMES = ['Primary', 'Secondary', 'Aux 1', 'Aux 2']

export default function Step4VisualRules() {
  const rules = useProject((s) => s.visualRules)
  const approved = useProject((s) => s.approved.rules)
  const selectedDirection = useProject((s) => s.selectedDirection)
  const selectedLogo = useProject((s) => s.selectedLogo)
  const approveRules = useProject((s) => s.approveRules)

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const pal = directionPalette(selectedDirection)
  const dna = (rules && rules.visualDNA) || {}

  async function generate() {
    setBusy(true)
    setErr(null)
    try {
      const r = await generateVisualRules(useProject.getState())
      if (!r.visualDNA) r.visualDNA = {}
      useProject.getState().setVisualRules(r)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onExport(format) {
    setErr(null)
    try {
      const state = useProject.getState()
      if (format === 'html') download(`${brandSlug(state)}-visual-rules.html`, await exportHTML(state))
      else if (format === 'md') download(`${brandSlug(state)}-visual-rules.md`, exportMarkdown(state))
      else download(`${brandSlug(state)}-project.json`, JSON.stringify(state, null, 2))
    } catch (e) {
      setErr(`Export failed: ${e.message}`)
    }
  }

  return (
    <>
      <Panel
        title="Brand Visual Rules"
        actions={
          <>
            <Button className="sm primary" busy={busy} onClick={generate} disabled={!selectedLogo}>
              {busy ? 'Compiling…' : rules ? 'Regenerate Rules' : 'Generate Brand Visual Rules'}
            </Button>
            {rules && (
              <Button className="sm warm" onClick={approved ? null : approveRules}>
                {approved ? '✓ Finalised' : 'Approve & finalise'}
              </Button>
            )}
            {rules && (
              <>
                <Button className="sm" onClick={() => onExport('html')}>Export HTML</Button>
                <Button className="sm" onClick={() => onExport('md')}>Export Markdown</Button>
              </>
            )}
          </>
        }
      >
        <ErrorNote>{err}</ErrorNote>

        {/* 引用：已选 Logo 与 色卡 */}
        {selectedLogo && selectedLogo.image && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '2px 0 16px' }}>
            <img
              src={selectedLogo.image}
              alt=""
              style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="sec-title" style={{ margin: '0 0 4px' }}>Selected logo</div>
              <strong>{selectedLogo.conceptName || '—'}</strong>
              <p className="hint" style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{selectedLogo.explanation}</p>
            </div>
          </div>
        )}

        {pal.length >= 2 && (
          <div style={{ margin: '2px 0 16px' }}>
            <div className="sec-title" style={{ margin: '0 0 8px' }}>Approved palette</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {pal.slice(0, 4).map((h, i) => (
                <div key={h} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 34, borderRadius: 6, border: '1px solid var(--border)', background: h }} />
                  <div className="hint" style={{ fontSize: 11, marginTop: 4 }}>
                    {PAL_NAMES[i] || ''} · {h}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!rules && !err ? (
          <div className="hint" style={{ padding: 26, textAlign: 'center' }}>
            {busy ? 'Compiling approved decisions and the Visual DNA into one visual system…' : 'No rules yet — compile everything (including the 8-dimension Visual DNA) into a single brand visual guide.'}
          </div>
        ) : (
          rules && (
            <>
              {rules.summary && (
                <div style={{ marginBottom: 14 }}>
                  <div className="sec-title">01 · Brand Visual Summary</div>
                  <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{rules.summary}</p>
                </div>
              )}
              {rules.logoRule && (
                <div style={{ marginBottom: 14 }}>
                  <div className="sec-title">02 · Logo Rules</div>
                  <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{rules.logoRule}</p>
                </div>
              )}

              {Object.keys(dna).length > 0 && (
                <>
                  <div className="sec-title">Visual DNA — 8 dimensions</div>
                  <div className="grid-4">
                    {DNA_KEYS.map((key) => {
                      const dim = dna[key]
                      if (!dim) return null
                      return (
                        <div key={key} className="dna-dim">
                          <h4>{DNA_LABELS[key]}</h4>
                          <div className="p">{dim.principle || '—'}</div>
                          <ListBlock title="DO" items={dim.do} variant="do" />
                          <ListBlock title="DON'T" items={dim.dont} variant="dont" />
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {rules.doDont && (
                <div className="grid-3">
                  <div>
                    <div className="sec-title">Overall DO</div>
                    <ListBlock items={rules.doDont.do} variant="do" />
                  </div>
                  <div>
                    <div className="sec-title">Overall DON'T</div>
                    <ListBlock items={rules.doDont.dont} variant="dont" />
                  </div>
                </div>
              )}

              {approved && <p className="hint ok" style={{ marginBottom: 0 }}>Finalised.</p>}
            </>
          )
        )}
      </Panel>
      <p className="footer-note">
        Exported HTML embeds the logo and palette so the guide stays valid beyond the 24h image-URL window.
      </p>
    </>
  )
}

function brandSlug(p) {
  const n = (p.brandCore && p.brandCore.brandName) || 'brand'
  return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand'
}