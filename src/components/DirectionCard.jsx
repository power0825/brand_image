import { Button, ImageSlot, KV } from './ui'
import { directionPalette } from '../services/palette'

export default function DirectionCard({ direction, index, selected, busyImage, onSelect, onRegenerate }) {
  const letter = String.fromCharCode(65 + index)
  const rows = [
    ['Mood', direction.mood],
    ['Color', direction.color],
    ['Lighting', direction.lighting],
    ['Typography', direction.typography],
    ['Material', direction.material],
  ]
  const pal = directionPalette(direction)
  const palNames = ['primary', 'secondary', 'aux1', 'aux2']

  return (
    <div className={'card' + (selected ? ' selected' : '')}>
      <div className="hero-wrap">
        <ImageSlot
          url={direction.heroImage}
          busy={busyImage}
          label={`Rendering ${direction.name || 'direction'}…`}
          onRetry={onRegenerate}
        />
      </div>

      <div className="card-body">
        <strong style={{ fontSize: 13.5, lineHeight: 1.45 }}>
          【{letter}. {direction.name}】 {direction.coreIdea}
        </strong>

        <div>
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <KV key={k} k={k} v={typeof v === 'string' && v.length > 130 ? v.slice(0, 130) + '…' : v} />
          ))}
        </div>

        {pal.length >= 2 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {pal.slice(0, 4).map((h, i) => (
              <div key={h} title={`${palNames[i] || ''} — ${h}`} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 18, borderRadius: 5, border: '1px solid var(--border)', background: h }} />
                <div className="hint" style={{ fontSize: 10.5, marginTop: 2 }}>{h}</div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <p className="hint ok" style={{ fontSize: 12.5, marginBottom: 0 }}>
            Approved — this direction drives Step 03. Continue in the stepper above.
          </p>
        )}
      </div>

      <div className="card-foot">
        <Button className="sm primary" disabled={busyImage || selected} onClick={onSelect}>
          {selected ? '✓ Approved' : 'Approve this'}
        </Button>
        <Button className="sm" disabled={busyImage} onClick={onRegenerate}>Regenerate visual</Button>
      </div>
    </div>
  )
}