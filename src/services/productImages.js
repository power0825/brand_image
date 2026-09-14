/**
 * Product reference image: compressed to a localStorage-friendly data URL.
 * It is required; Step 2 uses this single photo as an
 * image-to-image reference (doubao-seedream supports an `image` field).
 */

export function fileToCompressedDataURL(file, maxDim = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth || 1024
      let h = img.naturalHeight || 1024
      const scale = Math.min(1, maxDim / Math.max(w, h))
      w = Math.max(1, Math.round(w * scale))
      h = Math.max(1, Math.round(h * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      // white ground so transparent PNGs don't flatten to black in JPEG
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the image file'))
    }
    img.src = url
  })
}

export const MAX_PRODUCT_IMAGES = 1
