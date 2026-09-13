const OUTPUT_JSON = `{
  "brandName": "", "purpose": "", "promise": "",
  "targetAudience": "", "positioning": "", "personality": "",
  "keyDifferentiation": "", "usageContext": "", "tagline": ""
}`

export function brandCoreFromTextPrompt(text) {
  return {
    system: `You extract a brand strategy from a raw document.
- Read carefully and fill ONLY the fields that are stated or clearly implied.
- Keep the document's original wording / language where possible.
- If a field is absent, return an empty string "".
- Do not invent facts that are not in the document.
Output ONLY valid JSON (no markdown fences) with EXACTLY these keys:
${OUTPUT_JSON}`,
    user: `Document:\n\n${text.slice(0, 20000)}`,
  }
}