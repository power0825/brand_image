import { useState } from 'react'
import { useProject } from '../store'

export function Spinner() {
  return <span className="spinner" aria-label="loading" />
}

export function Button({ children, onClick, variant, disabled, className = '', busy, ...rest }) {
  const cls = ['btn', variant ? variant : '', className].filter(Boolean).join(' ')
  return (
    <button className={cls} onClick={onClick} disabled={disabled || busy} {...rest}>
      {busy && <Spinner />}
      {children}
    </button>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return <div className="error">{children}</div>
}

export function Panel({ title, actions, children, footer }) {
  return (
    <section className="panel">
      {(title || actions) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          <span className="spacer" />
          {actions}
        </div>
      )}
      {children}
      {footer}
    </section>
  )
}

export function Labelled({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function ChipEditor({ label, value = [], onChange, placeholder, max = 30 }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...(Array.isArray(value) ? value : []), v.slice(0, max)])
    setDraft('')
  }
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="chips">
        {(Array.isArray(value) ? value : []).map((v, i) => (
          <span key={i} className="chip">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        <input
          className="input"
          style={{ width: 140 }}
          placeholder={placeholder || 'add…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add() }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
        />
      </div>
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      className="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {copied ? '✓ copied' : label}
    </Button>
  )
}

export function KV({ k, v, href }) {
  if (v === undefined || v === null || v === '') return null
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v">{href ? <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{v}</a> : v}</span>
    </div>
  )
}

export function ImageSlot({ url, busy, label, onRetry }) {
  if (url) {
    return <img className="hero" src={url} alt="" loading="lazy" />
  }
  return (
    <div className="img-sk hero">
      {busy ? (
        <>
          <Spinner />
          <span className="hint">{label || 'Generating…'}</span>
        </>
      ) : (
        <>
          <span className="hint">No image yet</span>
          {onRetry && <Button className="sm" onClick={onRetry}>Retry</Button>}
        </>
      )}
    </div>
  )
}

export function ListBlock({ title, items, variant }) {
  if (!items || !items.length) return null
  return (
    <div>
      {title && <div className="sec-title">{title}</div>}
      <ul className={variant || ''}>
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  )
}

/** Small strip of uploaded reference-product photos, shown when any exist. */
export function ProductStrip() {
  const productImages = useProject((s) => s.productImages)
  if (!productImages || !productImages.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '2px 0 12px', flexWrap: 'wrap' }}>
      <span className="hint" style={{ fontWeight: 700 }}>Reference product:</span>
      {productImages.map((p) => (
        <img
          key={p.id}
          src={p.dataUrl}
          alt=""
          title={p.name || 'product reference'}
          style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
        />
      ))}
    </div>
  )
}