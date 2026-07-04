import type { AiConfig } from '@/types'

const AI_CONFIG_KEY = 'postflow-ai-config'

/** 文本：DeepSeek（OpenAI 兼容） */
export const DEFAULT_LLM = {
  apiBase: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
} as const

/** 图片：字节跳动 Seedream（火山引擎 Ark） */
export const DEFAULT_IMAGE = {
  apiBase: 'https://ark.cn-beijing.volces.com/api/v3',
  model: 'doubao-seedream-5-0-260128',
} as const

export const DEFAULT_AI_CONFIG: AiConfig = {
  llmApiBase: DEFAULT_LLM.apiBase,
  llmApiKey: '',
  llmModel: DEFAULT_LLM.model,
  imageApiBase: DEFAULT_IMAGE.apiBase,
  imageApiKey: '',
  imageModel: DEFAULT_IMAGE.model,
}

export function isSeedreamProvider(apiBase: string, model: string): boolean {
  return (
    apiBase.includes('volces.com') ||
    model.includes('seedream') ||
    model.includes('doubao-seed')
  )
}

export function loadAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (!raw) return DEFAULT_AI_CONFIG
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_AI_CONFIG
  }
}

export function saveAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
}

export function hasLlmConfig(config: AiConfig): boolean {
  return Boolean(config.llmApiKey.trim())
}

export function hasImageConfig(config: AiConfig): boolean {
  return Boolean(config.imageApiKey.trim())
}
