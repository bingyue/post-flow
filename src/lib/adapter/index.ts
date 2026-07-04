import type { Platform, PlatformVariant } from '@/types'
import { generateId } from '@/lib/utils'

interface MasterDraft {
  masterTitle: string
  masterBody: string
  masterTags: string[]
}

export function adaptToPlatforms(
  draftId: string,
  master: MasterDraft,
  platforms: Platform[],
  options?: { addFollowCta?: boolean }
): PlatformVariant[] {
  return platforms.map((platform) => adaptSingle(draftId, master, platform, options))
}

function adaptSingle(
  draftId: string,
  master: MasterDraft,
  platform: Platform,
  options?: { addFollowCta?: boolean }
): PlatformVariant {
  const now = new Date().toISOString()

  if (platform === 'xhs') {
    let title = master.masterTitle
    const titleWarning = title.length > 20
    if (titleWarning) title = title.slice(0, 19) + '…'

    let body = master.masterBody
    if (!body.includes('✨') && !body.includes('️')) {
      body = body.replace(/\n\n/g, '\n\n✨ ')
    }
    const tags =
      master.masterTags.length >= 3
        ? master.masterTags.slice(0, 10)
        : [...master.masterTags, '生活分享', '日常'].slice(0, 8)

    return {
      id: generateId('var'),
      draftId,
      platform: 'xhs',
      title,
      body: body.slice(0, 1200),
      tags,
      createdAt: now,
      updatedAt: now,
    }
  }

  // wechat_mp
  const title = master.masterTitle.slice(0, 64)
  let body = master.masterBody
  if (!body.startsWith('##')) {
    body = `## 正文\n\n${body}`
  }
  if (options?.addFollowCta !== false && !body.includes('关注')) {
    body += '\n\n---\n\n👉 点击关注，获取更多优质内容'
  }

  const bodyHtml = body
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
      if (line === '---') return '<hr/>'
      if (!line.trim()) return ''
      return `<p>${line}</p>`
    })
    .filter(Boolean)
    .join('')

  return {
    id: generateId('var'),
    draftId,
    platform: 'wechat_mp',
    title,
    body,
    bodyHtml,
    tags: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function diffText(original: string, adapted: string): { changed: boolean; summary: string } {
  const changed = original.trim() !== adapted.trim()
  const origLen = original.length
  const newLen = adapted.length
  const summary = changed
    ? `字数 ${origLen} → ${newLen}（${newLen > origLen ? '+' : ''}${newLen - origLen}）`
    : '无变化'
  return { changed, summary }
}
