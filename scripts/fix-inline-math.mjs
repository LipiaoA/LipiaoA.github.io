#!/usr/bin/env node
/**
 * 将「同一行内」混排的 $$...$$ 转为行内公式 $...$
 * 独立成行的块级公式（整行只有 $$...$$）保持不变
 *
 * 用法:
 *   node scripts/fix-inline-math.mjs              # 处理 docs/blogs
 *   node scripts/fix-inline-math.mjs --dry-run    # 仅预览
 *   node scripts/fix-inline-math.mjs path/to.md   # 指定文件或目录
 */

import fs from 'node:fs'
import path from 'node:path'

const dryRun = process.argv.includes('--dry-run')
const targets = process.argv.filter((a) => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1])
const root = targets.length ? path.resolve(targets[0]) : path.resolve('docs/blogs')

const INLINE_MATH = /\$\$([^$]+?)\$\$/g

function stripInlineMath(line) {
  return line.replace(/\$\$[^$]+?\$\$/g, '')
}

function isBlockMathLine(line) {
  const t = line.trim()
  if (t === '$$') return true
  return /^\$\$[^$]+\$\$$/.test(t)
}

function hasTextOutsideMath(line) {
  return stripInlineMath(line).trim().length > 0
}

function fixLine(line) {
  if (line.trim() === '$$') return line
  if (!/\$\$[^$]+?\$\$/.test(line)) return line
  if (!hasTextOutsideMath(line)) return line
  return line.replace(/\$\$([^$]+?)\$\$/g, (_, content) => `$${content}$`)
}

function fixContent(text) {
  let replacements = 0
  const lines = text.split('\n')
  const out = lines.map((line) => {
    const before = line
    const after = fixLine(line)
    if (before !== after) {
      const n = (before.match(/\$\$[^$]+?\$\$/g) || []).length
      replacements += n
    }
    return after
  })
  return { text: out.join('\n'), replacements }
}

function collectMdFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...collectMdFiles(p))
    else if (e.isFile() && e.name.endsWith('.md')) files.push(p)
  }
  return files
}

function main() {
  const files = fs.statSync(root).isDirectory() ? collectMdFiles(root) : [root]
  let totalFiles = 0
  let totalReplacements = 0

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8')
    const { text, replacements } = fixContent(original)
    if (replacements === 0) continue

    totalFiles++
    totalReplacements += replacements
    const rel = path.relative(process.cwd(), file)
    console.log(`${dryRun ? '[dry-run] ' : ''}${rel}: ${replacements} 处`)

    if (!dryRun && text !== original) {
      fs.writeFileSync(file, text, 'utf8')
    }
  }

  console.log(
    `\n${dryRun ? '预计' : '已'}处理 ${totalFiles} 个文件，共 ${totalReplacements} 处 inline 公式替换`,
  )
}

main()
