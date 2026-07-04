'use client'

import Link from 'next/link'
import { loadAiConfig, hasLlmConfig } from '@/lib/ai/config'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AiConfigBanner() {
  const [llmReady, setLlmReady] = useState(false)
  const [llmModel, setLlmModel] = useState('')
  const [imageReady, setImageReady] = useState(false)
  const [imageModel, setImageModel] = useState('')

  useEffect(() => {
    const cfg = loadAiConfig()
    setLlmReady(hasLlmConfig(cfg))
    setLlmModel(cfg.llmModel)
    setImageReady(Boolean(cfg.imageApiKey.trim()))
    setImageModel(cfg.imageModel)
  }, [])

  if (llmReady || imageReady) {
    return (
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800 space-y-1">
        {llmReady && (
          <div>
            文本 · DeepSeek <strong>{llmModel}</strong>
          </div>
        )}
        {imageReady && (
          <div>
            配图 · Seedream <strong>{imageModel}</strong>
          </div>
        )}
        {!llmReady && <div className="text-amber-700">文本未配置 DeepSeek Key，写稿走 Mock</div>}
        {!imageReady && <div className="text-amber-700">配图未配置 Seedream Key，配图走 Mock</div>}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center justify-between gap-4">
      <span>
        未配置 API Key。文本请填 DeepSeek Key，配图请填字节 Seedream Key；未配置项使用 Mock。
      </span>
      <Link href="/settings" className="flex items-center gap-1 font-medium text-indigo-600 hover:underline shrink-0">
        <Settings className="h-4 w-4" /> 配置
      </Link>
    </div>
  )
}
