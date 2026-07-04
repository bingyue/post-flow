import type { ComplianceIssue, ComplianceResult, Platform } from '@/types'

const FORBIDDEN_WORDS = ['最好', '第一', '100%', '国家级', '最强']
const AD_LAW_WORDS = ['治愈', '秒杀', '限时免费']

export function scanCompliance(
  title: string,
  body: string,
  tags: string[],
  platform: Platform
): ComplianceResult {
  const issues: ComplianceIssue[] = []
  const fullText = [title, body, ...tags].join(' ')

  FORBIDDEN_WORDS.forEach((word) => {
    const idx = fullText.indexOf(word)
    if (idx >= 0) {
      issues.push({
        type: 'forbidden_word',
        word,
        position: idx,
        severity: 'error',
        message: `含违禁词「${word}」`,
        suggestion: '请删除或替换该词汇',
      })
    }
  })

  AD_LAW_WORDS.forEach((word) => {
    if (fullText.includes(word)) {
      issues.push({
        type: 'ad_law_risk',
        word,
        severity: 'warning',
        message: `广告法风险词「${word}」`,
        suggestion: '建议使用更中性的表述',
      })
    }
  })

  if (platform === 'xhs') {
    if (title.length > 20) {
      issues.push({
        type: 'length_exceeded',
        severity: 'error',
        message: `小红书标题 ${title.length} 字，超过 20 字限制`,
      })
    }
    if (body.length > 1000) {
      issues.push({
        type: 'length_exceeded',
        severity: 'warning',
        message: `正文 ${body.length} 字，建议不超过 1000 字`,
      })
    }
    if (/https?:\/\//.test(body)) {
      issues.push({
        type: 'platform_rule',
        severity: 'warning',
        message: '小红书笔记含外链，可能被限流',
        suggestion: '建议移除链接或改为口播引导',
      })
    }
  }

  if (platform === 'wechat_mp' && title.length > 64) {
    issues.push({
      type: 'length_exceeded',
      severity: 'error',
      message: `公众号标题 ${title.length} 字，超过 64 字限制`,
    })
  }

  const hasError = issues.some((i) => i.severity === 'error')
  return { passed: !hasError, issues }
}
