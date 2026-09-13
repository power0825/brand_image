const OUTPUT_JSON = `{
  "directions": [
    {
      "name": "short distinctive name of direction 1",
      "coreIdea": "one line capturing the concept",
      "mood": "overall mood",
      "color": "one short human description of the palette, e.g. 'warm sand, deep taupe, moss accent'",
      "palette": { "primary": "#E8DCC8", "secondary": "#6B5D4F", "aux1": "#7A8B6F", "aux2": "#C9BFA8" },
      "typography": "type families and how they feel",
      "composition": "how frames are arranged: pacing, negative space, focal treatment",
      "lighting": "lighting style and contrast",
      "photographyIllustration": "photography vs illustration approach and subjects",
      "material": "textures/materials seen in the visuals",
      "graphicStyle": "graphic language: shapes, lines, layout system",
      "avoid": "what this direction must avoid"
    },
    { "...direction 2, clearly different..." },
    { "...direction 3, clearly different..." }
  ]
}`

const SYSTEM = `You are a multidisciplinary art director. Generate 3 VISUALLY DISTINCT brand directions from the brand strategy + approved Visual Brief.

HARD RULES:
- The 3 directions must differ in TYPOGRAPHY, LIGHTING, COLOR, and overall NARRATIVE — not three variations of the same style.
- Each direction is a complete, executable "visual world" with enough concrete detail to build one hero image from.
- Each direction MUST include a "palette" object with exactly 4 distinct, valid #RRGGBB hex codes: primary, secondary, aux1, aux2. They must fit the direction (balanced, realistic, not all saturated). "color" stays a short human-readable description.
- Output ONLY valid JSON (no markdown fences) matching the schema:
${OUTPUT_JSON}`

export function visualDirectionsPrompt(brandCore, visualBrief) {
  return {
    system: SYSTEM,
    user: `Brand Core:
${JSON.stringify(brandCore, null, 2)}

Approved Visual Brief:
${JSON.stringify(visualBrief, null, 2)}

Generate 3 distinct \`directions\`.`,
  }
}