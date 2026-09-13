import { useRef, useState } from 'react'
import { useProject } from '../store'
import Stepper from '../components/Stepper'
import ApiConfigModal from '../components/ApiConfigModal'
import Step1VisualBrief from '../steps/Step1VisualBrief'
import Step2VisualDirections from '../steps/Step2VisualDirections'
import Step3BrandIdentity from '../steps/Step3BrandIdentity'
import Step4VisualRules from '../steps/Step4VisualRules'

const STEPS = [Step1VisualBrief, Step2VisualDirections, Step3BrandIdentity, Step4VisualRules]

export default function App() {
  const step = useProject((s) => s.step)
  const brandName = useProject((s) => s.brandCore && s.brandCore.brandName)
  const reset = useProject((s) => s.reset)
  const importProject = useProject((s) => s.importProject)

  const [cfgOpen, setCfgOpen] = useState(false)
  const fileRef = useRef(null)

  function newProject() {
    if (confirm('Start a new project? Approved steps and results will be cleared (connections are kept).')) {
      reset()
    }
  }

  async function onImportFile(e) {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const obj = JSON.parse(await f.text())
      importProject(obj)
    } catch (err) {
      alert('Cannot import project: ' + err.message)
    }
  }

  const Current = STEPS[step] || STEPS[0]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          Brand Visual Workflow
          {brandName && <small>— {brandName}</small>}
        </div>
        <button className="btn sm" onClick={() => fileRef.current && fileRef.current.click()} title="Import a previously exported project JSON">Import JSON</button>
        <button className="btn sm" onClick={() => alert('Project is auto-saved to localStorage. To back it up, use Export JSON from Step 04.')} title="Projects persist in this browser via localStorage">Saved</button>
        <button className="btn sm danger" onClick={newProject}>New</button>
        <button className="btn sm primary" onClick={() => setCfgOpen(true)}>⚙ Connections</button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onImportFile} />
      </header>

      <Stepper />

      <main>
        <Current />
      </main>

      <ApiConfigModal open={cfgOpen} onClose={() => setCfgOpen(false)} />
    </div>
  )
}