import { useProject } from '../store'
import { STEPS } from '../app/stepperConfig'

const GATES = ['brief', 'directions', 'identity', 'rules'] // approved key gating the step AFTER it

export default function Stepper() {
  const step = useProject((s) => s.step)
  const approved = useProject((s) => s.approved)
  const setStep = useProject((s) => s.setStep)

  const canEnter = (i) => i === 0 || approved[GATES[i - 1]]

  return (
    <nav className="stepper">
      {STEPS.map((s, i) => {
        const available = canEnter(i)
        const cls = ['step-pill', s.id === STEPS[step].id ? 'active' : '', i < step ? 'done' : '', available ? '' : 'locked']
          .filter(Boolean)
          .join(' ')
        return (
          <div
            key={s.id}
            className={cls}
            role="button"
            tabIndex={available ? 0 : -1}
            onClick={() => available && setStep(i)}
            onKeyDown={(e) => available && (e.key === 'Enter' || e.key === ' ') && setStep(i)}
            title={available ? s.title : `Unlock by finishing ${STEPS[i - 1] ? STEPS[i - 1].title : ''}`}
          >
            <span className="s-num">{i < step ? '✓' : s.num}</span>
            {s.title}
            <span className="s-tag">{s.tag}</span>
          </div>
        )
      })}
    </nav>
  )
}