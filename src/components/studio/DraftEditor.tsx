'use client'

import { Label, Textarea, Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { X } from 'lucide-react'

export function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const addTag = (value: string) => {
    const t = value.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
  }

  return (
    <div>
      <Label>话题标签</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} color="xhs" className="gap-1 pr-1">
            #{tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="输入标签后回车"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag((e.target as HTMLInputElement).value)
            ;(e.target as HTMLInputElement).value = ''
          }
        }}
      />
    </div>
  )
}

export function DraftEditor({
  title,
  body,
  tags,
  onTitleChange,
  onBodyChange,
  onTagsChange,
  showTags = true,
}: {
  title: string
  body: string
  tags: string[]
  onTitleChange: (v: string) => void
  onBodyChange: (v: string) => void
  onTagsChange: (v: string[]) => void
  showTags?: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>标题 ({title.length} 字)</Label>
        <Input value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div>
        <Label>正文 ({body.length} 字)</Label>
        <Textarea value={body} onChange={(e) => onBodyChange(e.target.value)} rows={12} />
      </div>
      {showTags && <TagInput tags={tags} onChange={onTagsChange} />}
    </div>
  )
}
