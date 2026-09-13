const LOGO_OUTPUT_JSON = `{
  "logoConcepts": [
    {
      "conceptName": "short name for concept 1 (the wordmark)",
      "type": "wordmark",
      "explanation": "what the typographic treatment is / where the idea comes from",
      "whyFits": "why it fits the brand",
      "visualSpec": "self-contained English image prompt: the BRAND NAME as an artistic wordmark logo, centered on a plain neutral background, crisp vector style, brand name spelled correctly"
    },
    {
      "conceptName": "short name for concept 2 (combination)",
      "type": "combination",
      "explanation": "wordmark + simple graphic mark placed above the name",
      "whyFits": "why it fits the brand",
      "visualSpec": "self-contained English image prompt: the BRAND NAME in clean typography combined with a simple graphic mark placed above it, centered on a plain neutral background, crisp vector style, brand name spelled correctly"
    },
    {
      "conceptName": "short name for concept 3 (combination)",
      "type": "combination",
      "explanation": "wordmark + a different graphic mark and layout, clearly distinct from concept 2",
      "whyFits": "why it fits the brand",
      "visualSpec": "self-contained English image prompt: the BRAND NAME in a DIFFERENT type treatment with a DIFFERENT simple graphic mark integrated to the left of the name, centered on a plain neutral background, crisp vector style, brand name spelled correctly"
    }
  ]
}`

const LOGO_SYSTEM = `You are a logo designer paired with an image-generation model.

Produce exactly 3 logo concepts with PRESCRIBED FORMS:
- Concept 1 — WORDMARK (text logo): the brand name IS the logo. Use artistic typographic treatment — custom letterforms, ligatures, letter-spacing, or a subtle symbol woven INTO a letter — but it must remain clearly a text/wordmark logo.
- Concepts 2 and 3 — COMBINATION (wordmark + graphic mark): the brand name in clean typography combined with a simple graphic mark (symbol placed above, beside, or integrated with the name). Make concepts 2 and 3 clearly distinct from each other — different mark, different layout, different type treatment.

HARD RULES:
- NEVER deliver a pure pictorial/symbol logo without the name. The brand name must ALWAYS be present in every concept.
- "visualSpec" must be a self-contained English image prompt that renders the concept as one clean logo concept image: describe the lettering/style of the brand name, the mark and its placement relative to the name, a plain neutral background, and one restrained color from the direction palette. Brand name spelled correctly, no extra text, no watermark, no mockup.
Output ONLY valid JSON (no markdown fences) matching:
${LOGO_OUTPUT_JSON}`

function context(brandCore, visualBrief, direction) {
  return `Brand Core:
${JSON.stringify(brandCore, null, 2)}

Approved Visual Brief:
${JSON.stringify(visualBrief, null, 2)}

Selected Visual Direction:
${JSON.stringify(direction, null, 2)}`
}

export function logoConceptsPrompt(brandCore, visualBrief, direction) {
  return { system: LOGO_SYSTEM, user: context(brandCore, visualBrief, direction) + '\n\nProduce 3 logoConcepts.' }
}