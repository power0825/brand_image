import { useState } from 'react'
import { useProject } from '../store'
import { generateLogoConcepts } from '../services/llm'
import { logoImage } from '../services/image'
import { Button, ErrorNote, Panel, ProductStrip } from '../components/ui'
import LogoCard from '../components/LogoCard'

export default function Step3BrandIdentity() {
  const brandCore = useProject((s) => s.brandCore)
  const visualBrief = useProject((s) => s.visualBrief)
  const direction = useProject((s) => s.selectedDirection)
  const logoOptions = useProject((s) => s.logoOptions)
  const selectedLogo = useProject((s) => s.selectedLogo)
  const setLogoOptions = useProject((s) => s.setLogoOptions)
  const selectLogo = useProject((s) => s.selectLogo)

  const [busy, setBusy] = useState(false)
  const [genLogo, setGenLogo] = useState(-1)
  const [err, setErr] = useState(null)

  if (!direction) {
    return (
      <Panel title="Logo Concepts">
        <p className="hint">Select a visual direction in Step 02 first.</p>
      </Panel>
    )
  }

  async function regenerateLogo(i) {
    const item = logoOptions[i]
    if (!item) return
    setGenLogo(i)
    setErr(null)
    try {
      const url = await logoImage(item, direction, brandCore.brandName)
      setLogoOptions(logoOptions.map((l, j) => (j === i ? { ...l, image: url } : l)))
    } catch (e) {
      setErr(`Logo image ${i + 1} failed: ${e.message}`)
    } finally {
      setGenLogo(-1)
    }
  }

  async function generate() {
    setBusy(true)
    setErr(null)
    try {
      const list = await generateLogoConcepts(brandCore, visualBrief, direction)
      setLogoOptions(list)
      for (let i = 0; i < list.length; i++) {
        setGenLogo(i)
        try {
          const url = await logoImage(list[i], direction, brandCore.brandName)
          list[i] = { ...list[i], image: url }
          setLogoOptions([...list])
        } catch {
          list[i] = { ...list[i], logoError: true }
          setLogoOptions([...list])
        }
      }
    } catch (e) {
      setErr(e.message)
    } finally {
      setGenLogo(-1)
      setBusy(false)
    }
  }

  return (
    <>
      <Panel
        title="Logo Concepts"
        actions={
          <Button className="sm primary" busy={busy} onClick={generate}>
            {busy ? 'Creating 3 logo concepts…' : logoOptions.length ? 'Regenerate logo options' : 'Generate 3 Logo Options'}
          </Button>
        }
      >
        <ErrorNote>{err}</ErrorNote>
        <ProductStrip />

        {!logoOptions.length ? (
          <div className="hint" style={{ padding: 24, textAlign: 'center' }}>
            {busy ? 'Creating 3 logo concepts along the chosen direction…' : 'Generate 3 logo concepts based on the approved visual direction. (The Visual DNA is built into the Brand Rules in Step 04.)'}
          </div>
        ) : (
          <>
            <div className="grid-3">
              {logoOptions.map((logo, i) => (
                <LogoCard
                  key={i}
                  concept={logo}
                  index={i}
                  selected={!!selectedLogo && selectedLogo.conceptName === logo.conceptName}
                  busyImage={genLogo === i}
                  onSelect={() => selectLogo(logo)}
                  onRegenerate={() => regenerateLogo(i)}
                />
              ))}
            </div>
          </>
        )}
      </Panel>
    </>
  )
}