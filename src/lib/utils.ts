import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len - 1) + '…'
}

export function platformLabel(platform: 'xhs' | 'wechat_mp'): string {
  return platform === 'xhs' ? '小红书' : '微信公众号'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '编辑中',
    ready: '待发布',
    publishing: '发布中',
    published: '已发布',
    archived: '已归档',
    active: '已连接',
    expired: '已过期',
    pending: '连接中',
    error: '异常',
    revoked: '已移除',
    queued: '排队中',
    running: '发布中',
    succeeded: '成功',
    failed: '失败',
    retrying: '重试中',
    failed_final: '失败',
    cancelled: '已取消',
  }
  return map[status] ?? status
}
