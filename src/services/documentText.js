import JSZip from 'jszip'

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result || '')
    fr.onerror = () => reject(fr.error || new Error('Could not read file'))
    fr.readAsText(file)
  })
}

function xmlToText(xml) {
  return xml
    .replace(/<w:p[^>]*>|<\/w:p>/g, '\n') // Word paragraphs
    .replace(/<a:p[^>]*>|<\/a:p>/g, '\n') // PowerPoint paragraphs
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function slideNum(name) {
  const m = name.match(/slide(\d+)\.xml$/)
  return m ? Number(m[1]) : 0
}

async function extractOfficeText(file, ext) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  if (ext === 'docx') {
    const xmlFile = zip.file('word/document.xml')
    if (!xmlFile) throw new Error('Not a valid .docx (missing word/document.xml)')
    const xml = await xmlFile.async('string')
    const text = xmlToText(xml)
    if (!text) throw new Error('No readable text found in the .docx')
    return text
  }
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNum(a) - slideNum(b))
  if (!slides.length) throw new Error('Not a valid .pptx (no slide XML found)')
  const parts = []
  for (const n of slides) {
    const xml = await zip.file(n).async('string')
    const t = xmlToText(xml)
    if (t) parts.push('— slide —\n' + t)
  }
  const text = parts.join('\n\n')
  if (!text) throw new Error('No readable text found in the .pptx')
  return text
}

/**
 * Extract readable text from a user-selected file.
 * Returns { text } for documents, or { text, json } for .json files.
 * Throws a friendly Error for unsupported / unextractable formats (e.g. PDF).
 */
export async function extractText(file) {
  const name = (file && file.name) || ''
  const ext = (name.split('.').pop() || '').toLowerCase()

  if (['txt', 'md', 'markdown', 'csv', 'html', 'xwf'].includes(ext)) {
    return { text: await readAsText(file) }
  }

  if (ext === 'json') {
    const text = await readAsText(file)
    try {
      return { text, json: JSON.parse(text) }
    } catch {
      return { text } // invalid JSON -> treat as plain text for the AI parser
    }
  }

  if (ext === 'docx' || ext === 'pptx') {
    return { text: await extractOfficeText(file, ext) }
  }

  if (ext === 'pdf') {
    throw new Error('PDF text extraction is not supported in-browser yet.\nSave the PDF as Word (.docx) or plain text (.txt / .md), or paste the content directly.')
  }

  throw new Error(`Unsupported file type “${ext}”. Supported: .txt .md .csv .html .json .docx .pptx (PDF: convert first)`)
}