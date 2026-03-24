import { createBashTool, type BashToolkit } from 'bash-tool'
import { glob } from 'glob'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MONOREPO_ROOT = path.resolve(__dirname, '../../../..')
const DOCS_BASE = path.join(MONOREPO_ROOT, 'docs/easyeda-api-1.0.3')

export async function loadEasyEDADocs(): Promise<Record<string, string>> {
  const files: Record<string, string> = {}

  const patterns = [
    path.join(DOCS_BASE, 'guide', '**', '*.md'),
    path.join(DOCS_BASE, 'references', '**', '*.md'),
  ]

  for (const pattern of patterns) {
    const mdFiles = await glob(pattern)
    for (const fullPath of mdFiles) {
      const relativePath = path.relative(DOCS_BASE, fullPath)
      files[relativePath] = await readFile(fullPath, 'utf-8')
    }
  }

  console.log(`Loaded ${Object.keys(files).length} doc files into memory`)
  return files
}

let cachedTools: Promise<BashToolkit> | null = null

export async function getBashTool(): Promise<BashToolkit> {
  if (!cachedTools) {
    cachedTools = loadEasyEDADocs().then(files => createBashTool({ files }))
  }
  return cachedTools
}
