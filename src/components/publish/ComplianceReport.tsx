'use client'

import type { ComplianceResult } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export function ComplianceReport({ result }: { result: ComplianceResult }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        {result.passed ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">合规检测通过</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-700">存在需处理的问题</span>
          </>
        )}
      </div>
      {result.issues.length === 0 ? (
        <p className="text-sm text-slate-500">未发现敏感词或平台规则冲突</p>
      ) : (
        <ul className="space-y-2">
          {result.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle
                className={`h-4 w-4 mt-0.5 shrink-0 ${issue.severity === 'error' ? 'text-red-500' : 'text-amber-500'}`}
              />
              <div>
                <Badge color={issue.severity === 'error' ? 'danger' : 'warning'}>{issue.type}</Badge>
                <p className="mt-1 text-slate-700">{issue.message}</p>
                {issue.suggestion && <p className="text-slate-500 text-xs">{issue.suggestion}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
