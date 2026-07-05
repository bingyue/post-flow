'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDemoStore } from '@/lib/store/DemoStoreContext'
import { formatDate, statusLabel } from '@/lib/utils'
import type { DraftStatus } from '@/types'

export default function DraftsPage() {
  const { drafts, deleteDraft } = useDemoStore()
  const [filter, setFilter] = useState<DraftStatus | 'all'>('all')
  const [versionDraftId, setVersionDraftId] = useState<string | null>(null)

  const filtered = filter === 'all' ? drafts : drafts.filter((d) => d.status === filter)

  const versionDraft = drafts.find((d) => d.id === versionDraftId)

  return (
    <>
      <TopBar title="草稿箱" />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'draft', 'ready', 'published', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-sm ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {s === 'all' ? '全部' : statusLabel(s)}
            </button>
          ))}
        </div>

        <Card>
          <CardBody className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">标题</th>
                  <th className="px-4 py-3 text-left font-medium">选题</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">更新</th>
                  <th className="px-4 py-3 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{d.masterTitle || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{d.topic}</td>
                    <td className="px-4 py-3">
                      <Badge>{statusLabel(d.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(d.updatedAt)}</td>
                    <td className="px-4 py-3 space-x-2">
                      <Link href={`/studio/${d.id}`} className="text-indigo-600 hover:underline">
                        编辑
                      </Link>
                      <button
                        className="text-slate-500 hover:underline"
                        onClick={() => setVersionDraftId(d.id)}
                      >
                        版本
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => {
                          if (window.confirm('确认删除这个草稿吗？')) deleteDraft(d.id)
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {versionDraft && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={() => setVersionDraftId(null)} />
            <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
              <div className="border-b p-4 font-semibold">版本历史</div>
              <div className="p-4 space-y-3">
                {(versionDraft.versions.length > 0
                  ? versionDraft.versions
                  : [
                      {
                        id: 'v0',
                        draftId: versionDraft.id,
                        title: versionDraft.masterTitle,
                        body: versionDraft.masterBody,
                        tags: versionDraft.masterTags,
                        source: 'manual' as const,
                        createdAt: versionDraft.createdAt,
                      },
                    ]
                ).map((v, i) => (
                  <div key={v.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex justify-between">
                      <Badge color="info">v{versionDraft.versions.length - i || 1}</Badge>
                      <span className="text-xs text-slate-500">{formatDate(v.createdAt)}</span>
                    </div>
                    <div className="mt-2 font-medium">{v.title}</div>
                    <p className="mt-1 text-slate-500 line-clamp-2">{v.body}</p>
                  </div>
                ))}
              </div>
              <div className="border-t p-4">
                <Button variant="secondary" className="w-full" onClick={() => setVersionDraftId(null)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
