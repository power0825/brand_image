import { directionPalette } from '../services/palette'

const COMMON_STYLE = (d) =>
  [
    d && d.graphicStyle ? `graphic style: ${d.graphicStyle}.` : '',
    d && d.composition ? `composition: ${d.composition}.` : '',
    d && d.mood ? `mood: ${d.mood}.` : '',
    'no text, no watermark, no logo.',
  ]
    .filter(Boolean)
    .join(' ')

/** Soft palette reference for the scene (swatches are rendered by the UI, not drawn into the image). */
function paletteSwatchHint(direction) {
  const pal = directionPalette(direction)
  if (pal.length === 4) {
    return `Use these exact brand colors as the main palette of the scene: ${pal.join(' ')}.`
  }
  return ''
}

/** Hero visual for one visual direction. */
export function buildDirectionHeroPrompt(direction, brandCore) {
  return [
    'Create a brand hero image.',
    `brand essence: ${(brandCore && brandCore.brandName) || 'a brand'}${
      (brandCore && brandCore.purpose ? ` — ${brandCore.purpose}` : '')
    }.`,
    `core idea: ${direction.coreIdea}.`,
    `palette: ${direction.color}.`,
    `typography feeling: ${direction.typography}.`,
    `lighting: ${direction.lighting}.`,
    `photography or illustration: ${direction.photographyIllustration}.`,
    `materials: ${direction.material}.`,
    paletteSwatchHint(direction),
    COMMON_STYLE(direction),
    'photorealistic, high detail.',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Hero visual for one visual direction, when the user attached real product photos:
 * the model uses the single attached product image as reference (image-to-image), keeps
 * the product recognizable, and restyles the setting/lighting per the direction.
 */
export function buildDirectionImg2ImgPrompt(direction, brandCore) {
  return [
    'The attached image is the brand\'s actual product and the only reference product image — use this exact image as the product reference.',
    `Create a hero visual in the "${direction.name}" visual direction.`,
    `core idea: ${direction.coreIdea}.`,
    `mood: ${direction.mood}.`,
    `palette: ${direction.color}.`,
    `lighting: ${direction.lighting}.`,
    `photography / illustration cue: ${direction.photographyIllustration}.`,
    `environment and materials: ${direction.material}.`,
    `composition: ${direction.composition}.`,
    'Keep the product recognizable (roughly the same shape and identity) — restyle the scene, setting, lighting and atmosphere around it.',
    paletteSwatchHint(direction),
    'photorealistic, high detail, no watermark, no other brand logos, no text.',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Logo concept image from the visual spec produced by the LLM. */
export function buildLogoImagePrompt(concept, direction, brandName) {
  const name = (brandName && String(brandName).trim()) || 'the brand name'
  const type = concept && concept.type === 'wordmark' ? 'wordmark' : 'combination'
  const spec =
    (concept && concept.visualSpec) ||
    (type === 'wordmark'
      ? `artistic wordmark logo of ${name}, custom typographic lettering, centered on a plain neutral background`
      : `logo combining the wordmark ${name} with a simple supporting graphic mark, centered on a plain neutral background`)
  return [
    spec,
    type === 'wordmark'
      ? 'Render as a clean WORDMARK logo concept: the brand name is the hero, artistic lettering/typography with subtle stylised flourishes, crisp vector-like finish, centered, generous clear space.'
      : 'Render as a clean COMBINATION logo concept: the brand name in clear typography plus one simple supporting graphic mark, crisp vector-like finish, centered, generous clear space.',
    direction && direction.color ? `palette reference: ${direction.color}.` : '',
    'only the brand name as text, spelled correctly; no watermark, no mockup, no 3D, no photo, no decorative borders.',
  ]
    .filter(Boolean)
    .join(' ')
}