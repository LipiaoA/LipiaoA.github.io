#!/usr/bin/env node
/**
 * 去掉行内公式 $...$ 内侧首尾空格（KaTeX 默认不认 $ x $）
 * 不处理 $$...$$ 块级公式
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('docs/blogs')

function fixContent(text) {
  let count = 0
  const out = text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (full, body) => {
    const trimmed = body.trim()
    if (trimmed === body) return full
    count++
    return `$${trimmed}$`
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
