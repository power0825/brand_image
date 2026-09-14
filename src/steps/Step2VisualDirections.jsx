import { useState } from 'react'
import { useProject } from '../store'
import { generateVisualDirections } from '../services/llm'
import { directionImage } from '../services/image'
import { Button, ErrorNote, Panel, ProductImageInput } from '../components/ui'
import DirectionCard from '../components/DirectionCard'

export default function Step2VisualDirections() {
  const brandCore = useProject((s) => s.brandCore)
  const visualBrief = useProject((s) => s.visualBrief)
  const directions = useProject((s) => s.visualDirections)
  const productImages = useProject((s) => s.productImages)
  const selected = useProject((s) => s.selectedDirection)
  const setDirections = useProject((s) => s.setDirections)
  const selectDirection = useProject((s) => s.selectDirection)

  const [busy, setBusy] = useState(false)
  const [genImg, setGenImg] = useState(-1) // index currently rendering image
  const [err, setErr] = useState(null)

  async function regenerateHero(index) {
    setGenImg(index)
    setErr(null)
    try {
      const item = useProject.getState().visualDirections[index]
      if (!item) return
      const url = await directionImage(item, brandCore)
      useProject.setState((s) => ({
        visualDirections: s.visualDirections.map((d, i) => (i === index ? { ...d, heroImage: url, heroError: false } : d)),
      }))
    } catch (e) {
      setErr(`Hero image failed for "${useProject.getState().visualDirections[index]?.name || index + 1}": ${e.message}`)
    } finally {
      setGenImg(-1)
    }
  }

  async function generateAll() {
    if (!useProject.getState().productImages?.length) {
      setErr('Upload one reference product image before generating Visual Directions.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const list = await generateVisualDirections(brandCore, visualBrief)
      setDirections(list)
      // render hero visuals one at a time so the grid fills progressively
      for (let i = 0; i < list.length; i++) {
        setGenImg(i)
        try {
          const url = await directionImage(list[i], brandCore)
          list[i] = { ...list[i], heroImage: url }
          setDirections([...list])
        } catch (e) {
          list[i] = { ...list[i], heroError: true }
          setDirections([...list])
        }
      }
    } catch (e) {
      setErr(e.message)
    } finally {
      setGenImg(-1)
      setBusy(false)
    }
  }

  return (
    <>
      <Panel
        title="Three Visual Directions"
        actions={
          <>
            {directions.length > 0 && (
              <Button className="sm" onClick={() => setDirections([])}>Reset</Button>
            )}
            <Button className="sm primary" busy={busy || genImg >= 0} onClick={generateAll} disabled={!visualBrief || !productImages.length}>
              {busy ? 'Generating…' : directions.length ? 'Regenerate 3 directions' : 'Generate 3 Visual Directions'}
            </Button>
          </>
        }
      >
        <ErrorNote>{err}</ErrorNote>
        <ProductImageInput />
        {!productImages.length && (
          <p className="hint required-note" style={{ marginTop: -6 }}>Upload one required product image before generating Visual Directions.</p>
        )}
        {!directions.length ? (
          <div className="hint" style={{ padding: 30, textAlign: 'center' }}>
            {busy ? 'Exploring directions & rendering hero visuals…' : 'No directions yet.'}
          </div>
        ) : (
          <>
            <p className="hint" style={{ marginTop: 0 }}>
              AI explores three distinct visual worlds. <b>You decide</b> — ask the audience to vote. Each hero visual is
              generated live via Volcengine Ark (≥1920×1920).
            </p>
            <div className="grid-3">
              {directions.map((d, i) => (
                <DirectionCard
                  key={i}
                  direction={d}
                  index={i}
                  selected={!!selected && selected.name === d.name}
                  busyImage={genImg === i}
                  onSelect={() => selectDirection(d)}
                  onRegenerate={() => regenerateHero(i)}
                />
              ))}
            </div>
          </>
        )}
      </Panel>
      <p className="footer-note">Classroom moment: AI = explore, Human = decide.</p>
    </>
  )
}
