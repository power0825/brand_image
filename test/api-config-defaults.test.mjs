import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/store/projectStore.js', import.meta.url), 'utf8')

test('defaults use Ark Doubao Seed 2.0 Mini for browser mode', () => {
  assert.match(source, /textModel:\s*import\.meta\.env\.VITE_TEXT_MODEL \|\| ['"]doubao-seed-2-0-mini-260215['"]/, 'text model default')
  assert.match(source, /openAiBase:\s*\n\s*import\.meta\.env\.VITE_OPENAI_BASE_URL \|\|\s*['"]https:\/\/ark\.cn-beijing\.volces\.com\/api\/v3['"]/, 'text base default')
  assert.match(source, /direct:\s*true/, 'browser direct mode default')
})
test('New remounts the current step so local form state is cleared', () => {
  const app = fs.readFileSync(new URL('../src/app/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /projectKey/)
  assert.match(app, /<Current\s+key=\{projectKey\}/)
})

test('Visual Brief approval action is rendered in the panel footer', () => {
  const brief = fs.readFileSync(new URL('../src/steps/Step1VisualBrief.jsx', import.meta.url), 'utf8')
  assert.match(brief, /footer=\{/)
  assert.match(brief, /continue-btn/)
})