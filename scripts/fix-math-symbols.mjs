#!/usr/bin/env node
/**
 * 修复公式内常见 KaTeX 不兼容字符：
 * - 乘号 · → \cdot
 * - \mathbf\X → \mathbf{X}
 * 仅处理 $...$ 与 $$...$$ 内部
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('docs/blogs')

function fixMathSegment(tex) {
  return tex
    .replace(/·/g, '\\cdot ')
    .replace(/\\mathbf\s*\\([A-Za-z]+)/g, '\\mathbf{$1}')
    .replace(/\\mathbf\s+([A-Za-z])(?![a-zA-Z{])/g, '\\mathbf{$1}')
}

function fixContent(text) {
  let count = 0
  const out = text.replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g, (full, block, inline) => {
    const body = block ?? inline
    const fixed = fixMathSegment(body)
    if (fixed === body) return full
    count++
    return block !== undefined ? `$$${fixed}$$` : `$${fixed}$`
  })
  return { text: out, count }
}

function collectMdFiles(dir) {
  const files = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...collectMdFiles(p))
    else if (e.name.endsWith('.md')) files.push(p)
  }
  return files
}

let total = 0
for (const file of collectMdFiles(root)) {
  const original = fs.readFileSync(file, 'utf8')
  const { text, count } = fixContent(original)
  if (count) {
    fs.writeFileSync(file, text, 'utf8')
    total += count
    console.log(`${path.relative(process.cwd(), file)}: ${count} 处`)
  }
}
console.log(`\n共修复 ${total} 处`)
