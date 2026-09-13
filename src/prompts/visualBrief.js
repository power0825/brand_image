export const BRIEF_SCHEMA = {
  fields: [
    { key: 'brandEssence', label: 'Brand Essence' },
    { key: 'desiredPerception', label: 'Desired Perception' },
    { key: 'visualPersonality', label: 'Visual Personality' },
  ],
  arrays: [
    { key: 'visualKeywords', label: 'Visual Keywords' },
    { key: 'emotionalKeywords', label: 'Emotional Keywords' },
    { key: 'usageScenarios', label: 'Usage Scenarios' },
    { key: 'differentiationCues', label: 'Differentiation Cues' },
    { key: 'avoidList', label: 'Avoid List' },
  ],
}

const OUTPUT_JSON = `{
  "brandEssence": "one sentence: the soul of the brand",
  "desiredPerception": "what people should feel/think when they see this brand",
  "visualPersonality": "the personality expressed visually",
  "visualKeywords": ["5 visual words"],
  "emotionalKeywords": ["4 emotional words"],
  "usageScenarios": ["3-4 real scenarios where visuals appear"],
  "differentiationCues": ["2-3 visual cues that set it apart from competitors"],
  "avoidList": ["3-5 visual styles to strictly avoid"]
}`

const SYSTEM = `You are a senior brand strategist. You translate a brand's strategy into VISUAL MEANING.
Do NOT generate images. Just reason about how the brand should LOOK and FEEL.
Keep answers concise and concrete. Respond ONLY with valid JSON (no markdown fences, no extra text) matching this exact schema:
${OUTPUT_JSON}`

export function visualBriefPrompt(brandCore) {
  return {
    system: SYSTEM,
    user: `Brand Core (fields may be absent; work with what exists):

${JSON.stringify(brandCore, null, 2)}

Produce the Visual Brief JSON.`,
  }
}