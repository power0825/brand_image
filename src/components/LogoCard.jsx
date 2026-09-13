import { Button, ImageSlot } from './ui'

export default function LogoCard({ concept, index, selected, busyImage, onSelect, onRegenerate }) {
  return (
    <div className={'card' + (selected ? ' selected' : '')}>
      <div className="hero-wrap">
        <ImageSlot url={concept.image} busy={busyImage} label={`Rendering logo ${index + 1}…`} onRetry={onRegenerate} />
      </div>
      <div className="card-body">
        <strong>
          {index + 1}. {concept.conceptName || 'Concept'}
        </strong>
        <p className="hint" style={{ margin: 0 }}>{concept.explanation}</p>
        <p className="hint" style={{ margin: 0 }}><b>Why it fits:</b> {concept.whyFits}</p>
      </div>
      <div className="card-foot">
        <Button className="sm primary" disabled={busyImage} onClick={onSelect}>Choose this logo</Button>
        <Button className="sm" disabled={busyImage} onClick={onRegenerate}>Regenerate art</Button>
      </div>
    </div>
  )
}