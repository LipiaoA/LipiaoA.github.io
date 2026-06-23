import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'arcnew')
const DEST = path.join(ROOT, 'docs/blogs')

const FOLDER_MAP = {
  '0001-超标量处理器': 'SuperScalar',
  '0004-算法': 'Algorithm',
  '0003-Linux操作系统': 'LinuxOS',
  '0002-技术问题分析': 'TecAlyRecord',
}

const CATEGORY_MAP = {
  SuperScalar: { categories: ['超标量处理器'], tags: ['处理器'] },
  Algorithm: { categories: ['算法'], tags: ['算法导论'] },
  LinuxOS: { categories: ['Linux'], tags: ['Linux'] },
  TecAlyRecord: { categories: ['技术记录'], tags: ['性能分析'] },
  Misc: { categories: ['杂记'], tags: ['技术'] },
}

const SKIP_FILES = new Set([
  '超标量处理器设计与实现-Cache.md',
  '超标量处理器设计与实现-虚拟存储器.md',
])

const SS_SLUG = {
  '001': 'ss-001-overview',
  '002': 'ss-002-cache',
  '003': 'ss-003-virtual-memory',
  '004': 'ss-004-branch-prediction',
  '005': 'ss-005-riscv',
  '006': 'ss-006-decode',
  '007': 'ss-007-rename',
  '008': 'ss-008-dispatch',
}

function walkMd(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, base, out)
    else if (entry.name.endsWith('.md')) out.push(path.relative(base, full))
  }
  return out
}

function toAsciiSlug(rel, filename) {
  const base = filename.replace(/\.md$/, '')
  const parts = rel.split(path.sep)
  const blogFolder = parts.length > 1 ? FOLDER_MAP[parts[0]] : 'Misc'

  const algo = base.match(/算法导论-(\d+)-/)
  if (algo) return `algo-${algo[1].padStart(2, '0')}`

  if (base.match(/0012-2025-04-23/)) return 'algo-series-intro'

  const ss = base.match(/^(\d{3})-/)
  if (ss && blogFolder === 'SuperScalar' && SS_SLUG[ss[1]]) {
    return SS_SLUG[ss[1]]
  }

  const dated = base.match(/^(\d{4}-\d{2}-\d{2})-(.+)/)
  if (dated) return `${dated[1]}-${asciiSlug(dated[2])}`

  const numbered = base.match(/^(\d{4})-(.+)/)
  if (numbered) return `note-${numbered[1]}`

  if (blogFolder === 'TecAlyRecord') return 'linux-perf-analysis'

  if (base === '动态规划') return 'algo-dp-notes'

  if (blogFolder === 'LinuxOS' && ss) return `linux-${ss[1]}`

  return `post-${asciiSlug(base).replace(/[^\w-]/g, '').slice(0, 40)}` || 'post'
}

function asciiSlug(text) {
  const map = {
    磁盘格式: 'disk-format',
    文件系统: 'filesystem',
    技术: 'tech',
    遗留疑问: 'open-questions',
    操作系统: 'os',
    引论: 'intro',
    代码重构: 'refactor',
    蚁群算法学习笔记: 'ant-colony',
    redhat认证考试: 'redhat-exam',
    设计模式记录: 'design-patterns',
    系统调用研究: 'syscall',
    软考: 'ruankao',
    攻击树模型: 'attack-tree',
    linux内核: 'linux-kernel',
    linux基础: 'linux-basics',
    numpy使用记录: 'numpy-notes',
    k线技法入门: 'kline-intro',
  }
  for (const [k, v] of Object.entries(map)) {
    if (text.includes(k)) return v
  }
  return text
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 48) || 'post'
}

function extractTitle(content, filename) {
  const heading = content.match(/^#{1,6}\s+(.+)$/m)
  if (heading) {
    return heading[1]
      .trim()
      .replace(/^[#\s]+/, '')
      .replace(/^\d+[-.]?\s*/, '')
  }
  return filename.replace(/\.md$/, '')
}

function extractDate(filename) {
  const m = filename.match(/(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : '2025-08-01'
}

function fixImages(content, mdDir) {
  let out = content

  out = out.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const normalized = src.replace(/\\/g, '/')
    if (/^https?:\/\//.test(normalized)) return match
    const local = path.resolve(mdDir, normalized)
    if (fs.existsSync(local)) return match
    const name = path.basename(normalized)
    return `\n\n> **插图待补充**：${name}\n\n`
  })

  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const normalized = src.replace(/\\/g, '/')
    if (/^https?:\/\//.test(normalized)) return match
    if (normalized.startsWith('/')) return match
    const local = path.resolve(mdDir, normalized)
    if (fs.existsSync(local)) return match
    const name = path.basename(normalized)
    const label = alt?.trim() || name
    return `\n\n> **插图待补充**：${label}（\`${name}\`）\n\n`
  })

  return out
}

function copyAssets(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    if (!/\.(png|jpe?g|gif|svg|webp)$/i.test(entry.name)) continue
    fs.copyFileSync(path.join(srcDir, entry.name), path.join(destDir, entry.name))
  }
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  fs.rmSync(dir, { recursive: true, force: true })
}

rmrf(DEST)
fs.mkdirSync(DEST, { recursive: true })

const usedSlugs = new Map()
const migrated = []

for (const rel of walkMd(SRC)) {
  const filename = path.basename(rel)
  if (SKIP_FILES.has(filename)) {
    console.log('skip duplicate:', rel)
    continue
  }

  const parts = rel.split(path.sep)
  const blogFolder = parts.length > 1 ? FOLDER_MAP[parts[0]] : 'Misc'
  if (!blogFolder) {
    console.log('skip unknown folder:', rel)
    continue
  }

  const srcFile = path.join(SRC, rel)
  const srcDir = path.dirname(srcFile)
  let slug = toAsciiSlug(rel, filename)
  const slugKey = `${blogFolder}/${slug}`
  if (usedSlugs.has(slugKey)) {
    slug = `${slug}-${usedSlugs.get(slugKey) + 1}`
  }
  usedSlugs.set(slugKey, (usedSlugs.get(slugKey) || 0) + 1)

  const destDir = path.join(DEST, blogFolder)
  const destFile = path.join(destDir, `${slug}.md`)
  fs.mkdirSync(destDir, { recursive: true })
  copyAssets(srcDir, destDir)

  const raw = fs.readFileSync(srcFile, 'utf8').replace(/^\uFEFF/, '')
  const title = extractTitle(raw, filename)
  const date = extractDate(filename)
  const meta = CATEGORY_MAP[blogFolder]
  const body = fixImages(raw.trim(), destDir)

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title).slice(1, -1)}`,
    `date: ${date}`,
    'author: Atlas Lip',
    'categories:',
    ...meta.categories.map((c) => `  - ${c}`),
    'tags:',
    ...meta.tags.map((t) => `  - ${t}`),
    '---',
    '',
  ].join('\n')

  fs.writeFileSync(destFile, `${frontmatter}${body}\n`)
  migrated.push({ rel, dest: path.relative(DEST, destFile) })
}

console.log(`migrated ${migrated.length} articles`)
for (const item of migrated) console.log(`  ${item.rel} -> ${item.dest}`)
