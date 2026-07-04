'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, platformLabel, statusLabel } from '@/lib/utils'
import type { Platform } from '@/types'
import { RefreshCw, Trash2, Plus } from 'lucide-react'

export default function AccountsPage() {
  const { accounts, connectAccount, disconnectAccount, refreshAccount } = useDemoStore()
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    if (!connectPlatform) return
    setConnecting(true)
    await new Promise((r) => setTimeout(r, 1500))
    connectAccount(connectPlatform)
    setConnecting(false)
    setConnectPlatform(null)
  }

  return (
    <>
      <TopBar title="平台账号" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setConnectPlatform('xhs')}>
            <Plus className="h-4 w-4" /> 连接账号
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={acc.avatarUrl} alt="" className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{acc.nickname}</div>
                    <Badge color={acc.platform === 'xhs' ? 'xhs' : 'wechat'} className="mt-1">
                      {platformLabel(acc.platform)}
                    </Badge>
                    <div className="mt-2">
                      <Badge
                        color={
                          acc.status === 'active'
                            ? 'success'
                            : acc.status === 'expired'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {statusLabel(acc.status)}
                      </Badge>
                    </div>
                    {acc.errorMessage && (
                      <p className="mt-2 text-xs text-red-600">{acc.errorMessage}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      上次检查 {acc.lastHealthCheck && formatDate(acc.lastHealthCheck)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {(acc.status === 'expired' || acc.status === 'error') && (
                    <Button variant="secondary" size="sm" onClick={() => refreshAccount(acc.id)}>
                      <RefreshCw className="h-3 w-3" /> 重新授权
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => disconnectAccount(acc.id)}>
                    <Trash2 className="h-3 w-3" /> 移除
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Dialog
          open={connectPlatform !== null}
          onClose={() => setConnectPlatform(null)}
          title="连接平台账号"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConnectPlatform(null)}>
                取消
              </Button>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? '连接中…' : '模拟授权完成'}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600 mb-4">Demo 模式：选择平台后模拟 OAuth / 扫码授权流程</p>
          <div className="grid grid-cols-2 gap-3">
            {(['xhs', 'wechat_mp'] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setConnectPlatform(p)}
                className={`rounded-lg border-2 p-4 text-center ${connectPlatform === p ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
              >
                {platformLabel(p)}
              </button>
            ))}
          </div>
        </Dialog>
      </div>
    </>
  )
}
