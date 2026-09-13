import { directionPalette } from '../services/palette'

const OUTPUT_JSON = `{
  "summary": "one paragraph summarising the brand visual system",
  "logoRule": "how to use the logo: clear space, placement, what to avoid",
  "visualDNA": {
    "color":       { "principle": "one sentence", "do": ["3-4 concrete rules"], "dont": ["2-3 concrete rules"] },
    "typography":  { "principle": "...", "do": [...], "dont": [...] },
    "composition": { "principle": "...", "do": [...], "dont": [...] },
    "lighting":    { "principle": "...", "do": [...], "dont": [...] },
    "photography": { "principle": "...", "do": [...], "dont": [...] },
    "people":      { "principle": "...", "do": [...], "dont": [...] },
    "material":    { "principle": "...", "do": [...], "dont": [...] },
    "graphicLanguage": { "principle": "...", "do": [...], "dont": [...] }
  },
  "doDont": { "do": ["6-8 positive rules"], "dont": ["6-8 negative rules"] }
}`

const SYSTEM = `You are a brand system designer. Compile ALL previously approved decisions into ONE concise brand visual guide.
- Language: English, direct, production-ready.
- The 8-dimension Visual DNA IS the core rule body: for each of color / typography / composition / lighting / photography / people / material / graphicLanguage give a Principle (one sentence), 3-4 DO rules and 2-3 DON'T rules, concrete and actionable for an art director or an image model. Consistency comes from RULES, not from identical-looking images.
Output ONLY valid JSON (no markdown fences) matching:
${OUTPUT_JSON}`

export function visualRulesPrompt(project) {
  const { brandCore, visualBrief, selectedDirection, selectedLogo } = project
  const pal = directionPalette(selectedDirection)
  return {
    system: SYSTEM,
    user: `Approved inputs to compile:

Brand Core:
${JSON.stringify(brandCore, null, 2)}

Visual Brief:
${JSON.stringify(visualBrief, null, 2)}

Selected Visual Direction:
${JSON.stringify(
  selectedDirection
    ? {
        name: selectedDirection.name,
        coreIdea: selectedDirection.coreIdea,
        color: selectedDirection.color,
        mood: selectedDirection.mood,
        typography: selectedDirection.typography,
        lighting: selectedDirection.lighting,
        material: selectedDirection.material,
      }
    : null,
  null,
  2,
)}

Selected Logo Concept:
${JSON.stringify(
  selectedLogo
    ? { conceptName: selectedLogo.conceptName, explanation: selectedLogo.explanation, whyFits: selectedLogo.whyFits }
    : null,
  null,
  2,
)}

Approved palette (exact hex codes to reference):
${pal.length ? pal.join(', ') : '(direction color text used instead)'}

Produce the Brand Visual Rules JSON.`,
  }
}