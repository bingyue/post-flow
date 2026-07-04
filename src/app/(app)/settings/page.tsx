'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import {
  DEFAULT_AI_CONFIG,
  loadAiConfig,
  saveAiConfig,
} from '@/lib/ai/config'
import type { AiConfig } from '@/types'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const { resetDemo } = useDemoStore()
  const [config, setConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'ai' | 'general'>('ai')

  useEffect(() => {
    setConfig(loadAiConfig())
  }, [])

  const handleSave = () => {
    saveAiConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <TopBar title="设置" />
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          {(['ai', 'general'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
            >
              {t === 'ai' ? 'AI 配置' : '通用'}
            </button>
          ))}
        </div>

        {tab === 'ai' && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong>Demo 模式提示</strong>
                <p className="mt-1">
                  API Key 仅保存在本地浏览器（localStorage），不会写入服务端环境变量。请勿填入生产密钥。
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">文本生成 · DeepSeek</h3>
                <p className="mt-1 text-xs text-slate-500">
                  在{' '}
                  <a
                    href="https://platform.deepseek.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    platform.deepseek.com
                  </a>{' '}
                  获取 API Key
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <Label>DeepSeek API Base</Label>
                  <Input
                    value={config.llmApiBase}
                    onChange={(e) => setConfig({ ...config, llmApiBase: e.target.value })}
                    placeholder="https://api.deepseek.com/v1"
                  />
                </div>
                <div>
                  <Label>DeepSeek API Key</Label>
                  <Input
                    type="password"
                    value={config.llmApiKey}
                    onChange={(e) => setConfig({ ...config, llmApiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <Label>DeepSeek 模型</Label>
                  <Input
                    value={config.llmModel}
                    onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                    placeholder="deepseek-chat"
                  />
                  <p className="mt-1 text-xs text-slate-400">推荐 deepseek-chat；深度推理可用 deepseek-reasoner</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">图片生成 · 字节 Seedream</h3>
                <p className="mt-1 text-xs text-slate-500">
                  在{' '}
                  <a
                    href="https://console.volcengine.com/ark"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    火山引擎 Ark 控制台
                  </a>{' '}
                  获取 API Key（ARK_API_KEY）
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <Label>Seedream API Base</Label>
                  <Input
                    value={config.imageApiBase}
                    onChange={(e) => setConfig({ ...config, imageApiBase: e.target.value })}
                    placeholder="https://ark.cn-beijing.volces.com/api/v3"
                  />
                </div>
                <div>
                  <Label>Seedream API Key</Label>
                  <Input
                    type="password"
                    value={config.imageApiKey}
                    onChange={(e) => setConfig({ ...config, imageApiKey: e.target.value })}
                    placeholder="火山引擎 Ark API Key"
                  />
                </div>
                <div>
                  <Label>Seedream 模型</Label>
                  <Input
                    value={config.imageModel}
                    onChange={(e) => setConfig({ ...config, imageModel: e.target.value })}
                    placeholder="doubao-seedream-5-0-260128"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Seed 系列：doubao-seedream-5-0-* / 4-5-* / 4-0-* 等
                  </p>
                </div>
              </CardBody>
            </Card>

            <Button onClick={handleSave}>{saved ? '已保存 ✓' : '保存 AI 配置'}</Button>
          </>
        )}

        {tab === 'general' && (
          <Card>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-600">重置 Demo 数据为初始 Mock 状态（保留登录）。</p>
              <Button variant="danger" onClick={resetDemo}>
                重置 Demo 数据
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}
