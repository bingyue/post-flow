# PostFlow MVP 功能规格说明书（Functional Spec）

| 字段 | 内容 |
|------|------|
| 版本 | v1.0 |
| 日期 | 2026-07-04 |
| 状态 | 草稿 |
| 上游文档 | [PRD-PostFlow-20260704.md](../prd/PRD-PostFlow-20260704.md) |
| MVP 周期 | 8 周（W1–W8） |
| 目标读者 | 研发、设计、QA |

---

## 1. 文档目的与范围

### 1.1 目的

将 PRD 中 **MVP 阶段（✅ 标记）** 的需求转化为可开发、可测试、可验收的功能规格，作为 W1–W8 迭代的唯一功能基线。

### 1.2 MVP 目标（一句话）

**8 周内交付 Web 版闭环：用户可完成「AI 创作图文 → 多平台适配 → 预览确认 → 即时/定时发布到小红书 + 微信公众号」。**

### 1.3 MVP 功能边界

| 包含（In Scope） | 不包含（Out of Scope） |
|------------------|------------------------|
| F-01 AI 图文创作 | F-09 风格记忆库 |
| F-02 平台风格适配（小红书 + 公众号） | F-10 数据看板 |
| F-03 AI 配图生成 | F-12 协作审批 |
| F-04 平台账号连接（小红书 + 公众号） | F-13 模板市场 |
| F-05 即时发布 | F-14 开放 API |
| F-06 定时发布 | 微博 / 知乎（V1） |
| F-07 发布预览 | 短视频 / 直播 |
| F-08 草稿箱 | 移动端原生 App |
| F-11 敏感词/合规检测 | 付费订阅（M5 可简化版） |
| 用户注册/登录 | 评论自动回复 |

### 1.4 MVP 成功标准（Go-Live Gate）

| # | 标准 | 度量 |
|---|------|------|
| G1 | 内测用户首篇发布完成率 | ≥ 70% |
| G2 | 发布成功率（排除用户取消） | ≥ 95% |
| G3 | AI 生成 P95 延迟 | < 30s |
| G4 | 发布 P95 延迟 | < 120s |
| G5 | 定时发布准时率 | ≥ 99% |
| G6 | 核心流程可用性 | 99.5% |

---

## 2. 系统架构（MVP）

### 2.1 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端 | Next.js 15 + React + Tailwind CSS | Web 响应式，Desktop 优先 |
| 后端 | Next.js Route Handlers / 独立 API 服务 | MVP 可 Monolith |
| 数据库 | PostgreSQL（Supabase） | 主数据持久化 |
| 缓存/队列 | Redis + BullMQ | 定时发布、重试 |
| 对象存储 | S3 兼容（Supabase Storage） | 图片、草稿附件 |
| 认证 | Supabase Auth / NextAuth | Email + OAuth 登录 |
| LLM | DeepSeek / OpenAI（可配置） | 创作引擎 |
| 图片生成 | 即梦 / DALL·E API | 配图 Lab |

### 2.2 服务模块

```
post-flow/
├── src/app/             # Next.js 页面、Route Handlers、管理端
├── src/lib/             # AI、适配、发布、鉴权、数据库访问
├── src/components/      # 用户端/管理端 UI 组件
├── prisma/              # Prisma schema、SQLite migration
└── doc/                 # PRD、Spec、技术方案、项目管理等文档 workspace
```

MVP 阶段确认采用根目录单仓全栈实现；`creation`、`image`、`adapter`、`publish`、`compliance` 先以内聚模块沉淀在 `src/lib/` 与 Route Handlers 中，后续规模扩大后再按服务拆分。

### 2.3 发布连接器（MVP）

| 平台 | 实现方案 | 连接器 ID |
|------|----------|-----------|
| 微信公众号 | 微信开放平台 API（素材管理 + 发布） | `wechat_mp` |
| 小红书 | 受控浏览器自动化（CDP）+ 用户 Cookie 授权 | `xhs_cdp` |

> 连接器抽象接口见 §8.3。小红书方案需在内测前完成 200 次发布成功率验证（PRD A-03）。

---

## 3. 信息架构与页面规格

### 3.1 路由表

| 路由 | 页面 | 权限 | MVP |
|------|------|------|-----|
| `/` | Landing（公测 W8） | 公开 | W8 |
| `/login` | 登录 | 公开 | ✅ |
| `/register` | 注册 | 公开 | ✅ |
| `/onboarding` | 新用户引导 | 登录 | ✅ |
| `/dashboard` | 工作台 | 登录 | ✅ |
| `/studio/new` | 新建创作 | 登录 | ✅ |
| `/studio/[draftId]` | 编辑草稿 | 登录 | ✅ |
| `/studio/[draftId]/images` | 配图 Lab | 登录 | ✅ |
| `/studio/[draftId]/adapt` | 平台适配 | 登录 | ✅ |
| `/studio/[draftId]/preview` | 发布预览 | 登录 | ✅ |
| `/studio/[draftId]/publish` | 发布确认 | 登录 | ✅ |
| `/drafts` | 草稿箱 | 登录 | ✅ |
| `/queue` | 定时队列 | 登录 | ✅ |
| `/accounts` | 平台账号管理 | 登录 | ✅ |
| `/logs` | 发布日志 | 登录 | ✅ |
| `/settings` | 设置 | 登录 | ✅ |

### 3.2 页面规格摘要

#### 3.2.1 Dashboard（`/dashboard`）

**目的**：用户进入后的主控台，展示待办与状态。

| 区块 | 内容 | 交互 |
|------|------|------|
| 顶部 CTA | 「新建创作」按钮 | → `/studio/new` |
| 账号状态条 | 已连接平台及授权状态 | 失效时红色告警 + 跳转 `/accounts` |
| 待发布 | 草稿 status=`ready` 列表（最多 5 条） | 点击进入编辑/发布 |
| 定时队列 | 未来 7 天 scheduled jobs | → `/queue` |
| 最近发布 | 最近 10 条 publish logs | → `/logs` |
| AI 额度 | 本月已用/总量（Free: 5） | 超额时禁用生成按钮 |

**空状态**：无草稿时展示 Onboarding 卡片「完成你的第一篇发布」。

#### 3.2.2 创作 Studio（`/studio/new` → `/studio/[draftId]`）

| 区块 | 字段/组件 | 校验 |
|------|-----------|------|
| 平台选择 | 小红书 / 公众号 / 双平台 | 必选 |
| 选题输入 | textarea，≥10 字 | 不足时禁用生成 |
| 参考链接 | 可选 URL | 合法 URL |
| 生成按钮 | 「AI 生成」 | 扣减 AI 额度 |
| 编辑器 | 标题、正文、标签（tags） | 见平台规则 §6 |
| 快捷操作 | 重写 / 缩短 / 扩写 / 换标题 | 每次扣 0.5 额度 |
| 自动保存 | 每 30s 或失焦 | 写入 drafts |

#### 3.2.3 配图 Lab（`/studio/[draftId]/images`）

| 能力 | 规格 |
|------|------|
| 生成封面 | 基于正文自动生成 image_prompt，调用 Image API |
| 比例 | 小红书 3:4 (1080×1440)；公众号 2.35:1 (900×383) |
| 候选数量 | 默认 2 张，用户选 1 |
| 上传替换 | JPG/PNG/WebP，≤5MB |
| 重新生成 | 可编辑 prompt 后重试 |

#### 3.2.4 平台适配（`/studio/[draftId]/adapt`）

| 能力 | 规格 |
|------|------|
| 源稿 | 创作 Studio 的 master draft |
| 目标平台 | 用户已选平台的多选 |
| 输出 | 每个平台独立 `PlatformVariant` |
| Diff 视图 | 标题、正文变更高亮 |
| 手动编辑 | 各平台版本可独立改 |

#### 3.2.5 发布预览（`/studio/[draftId]/preview`）

| 平台 | 预览组件 |
|------|----------|
| 小红书 | NoteCard：封面 + 标题 + 正文前 3 行 + 标签 |
| 公众号 | ArticleListItem：封面 + 标题 + 摘要 |

#### 3.2.6 发布确认（`/studio/[draftId]/publish`）

| 步骤 | 规格 |
|------|------|
| 账号选择 | 每个目标平台下拉选已连接账号 |
| 合规扫描 | 自动运行 F-11，展示结果 |
| 发布模式 | 即时 / 定时 |
| 确认弹窗 | 默认开启，展示最终预览缩略图 |
| 提交 | 创建 PublishJob(s) |

---

## 4. 功能规格详述

### 4.1 F-01：AI 图文创作

#### 4.1.1 API

```
POST /api/v1/drafts
Body: { topic, platform_targets[], reference_url?, tone? }
Response: { draft_id, title, body, tags[], image_prompt }

POST /api/v1/drafts/:id/generate
Body: { action: "full" | "rewrite" | "shorten" | "expand" | "retitle" }
Response: { title, body, tags[], version_id }

PATCH /api/v1/drafts/:id
Body: { title, body, tags[], status }
```

#### 4.1.2 Prompt 策略

| 平台 | System Prompt 要点 |
|------|-------------------|
| 小红书 | 口语化、emoji 分段、标题 ≤20 字、3–8 个 #标签 |
| 公众号 | 小标题结构、800–2000 字、文末可选引导关注 |

#### 4.1.3 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F01-01 | 选题 ≥10 字 | 点击生成 | 30s 内返回 title+body+≥3 tags |
| TC-F01-02 | 选小红书 | 生成完成 | title ≤20 字，body 含分段 |
| TC-F01-03 | 选公众号 | 生成完成 | body 800–2000 字，含 ≥2 小标题 |
| TC-F01-04 | 已有草稿 | 点击「缩短」 | body 字数减少 ≥20% |
| TC-F01-05 | AI 额度为 0 | 点击生成 | 返回 402 + 升级提示 |

---

### 4.2 F-02：平台风格适配

#### 4.2.1 API

```
POST /api/v1/drafts/:id/adapt
Body: { target_platforms: ["xhs", "wechat_mp"] }
Response: { variants: [{ platform, title, body, tags[], diff_summary }] }

PATCH /api/v1/variants/:id
Body: { title, body, tags[] }
```

#### 4.2.2 适配规则引擎

| 规则 ID | 平台 | 规则 |
|---------|------|------|
| R-XHS-01 | 小红书 | title 超 20 字 → 自动截断 + 警告 |
| R-XHS-02 | 小红书 | 提取/生成 3–10 个话题标签 |
| R-XHS-03 | 小红书 | 正文建议 ≤1000 字，超出警告 |
| R-WX-01 | 公众号 | Markdown → 微信富文本 HTML |
| R-WX-02 | 公众号 | 可选插入「点击关注」引导段 |
| R-WX-03 | 公众号 | title ≤64 字 |

#### 4.2.3 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F02-01 | 1 篇源稿 | adapt 到 xhs+wechat | 返回 2 个独立 variant |
| TC-F02-02 | 长标题源稿 | adapt 到 xhs | title ≤20 字 |
| TC-F02-03 | Markdown 源稿 | adapt 到 wechat | body 为合法 HTML |

---

### 4.3 F-03：AI 配图生成

#### 4.3.1 API

```
POST /api/v1/drafts/:id/images/generate
Body: { platform, prompt?, count: 1|2 }
Response: { images: [{ id, url, width, height }] }

POST /api/v1/drafts/:id/images/upload
Body: multipart/form-data
Response: { image_id, url }

PUT /api/v1/drafts/:id/images/:imageId/select
Body: { role: "cover" | "inline" }
```

#### 4.3.2 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F03-01 | 已完成文稿 | 生成配图 | 60s 内返回 ≥1 张 |
| TC-F03-02 | 选小红书 | 生成封面 | 比例 3:4 |
| TC-F03-03 | 选公众号 | 生成封面 | 比例 2.35:1 |
| TC-F03-04 | 上传 6MB 图片 | upload | 返回 413 错误 |

---

### 4.4 F-04：平台账号连接

#### 4.4.1 API

```
GET  /api/v1/accounts
POST /api/v1/accounts/connect
Body: { platform: "xhs" | "wechat_mp" }
Response: { auth_url } | { session_id }  # 微信 OAuth / 小红书 QR

DELETE /api/v1/accounts/:id
POST   /api/v1/accounts/:id/refresh
GET    /api/v1/accounts/:id/health
```

#### 4.4.2 数据安全

- `auth_token` 字段 AES-256-GCM 加密，密钥存 KMS/环境变量
- API 响应永不返回明文 token
- 前端仅展示 nickname、avatar、platform、status

#### 4.4.3 账号状态机

```
pending → active → expired → revoked
                 ↘ error
```

| 状态 | UI 表现 |
|------|---------|
| active | 绿色，可选为发布账号 |
| expired | 红色，Dashboard 告警，一键重新授权 |
| error | 黄色，展示 error_message |

#### 4.4.4 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F04-01 | 未连接 | 连接公众号 | OAuth 完成后 status=active |
| TC-F04-02 | 已连接 | 删除账号 | 不可再用于发布 |
| TC-F04-03 | token 过期 | 发布 | 返回 AUTH_EXPIRED，Dashboard 告警 |

---

### 4.5 F-05：即时发布

#### 4.5.1 API

```
POST /api/v1/publish
Body: {
  variant_ids: string[],
  account_ids: string[],
  mode: "immediate",
  confirm: true
}
Response: { jobs: [{ job_id, status, platform_url? }] }

GET /api/v1/publish/:jobId
```

#### 4.5.2 发布 Job 状态机

```
queued → running → succeeded
                 ↘ failed → retrying → succeeded | failed_final
```

#### 4.5.3 错误码

| Code | 含义 | 用户提示 |
|------|------|----------|
| AUTH_EXPIRED | 授权失效 | 请重新连接账号 |
| CONTENT_VIOLATION | 内容违规 | 请修改后重试 |
| PLATFORM_RATE_LIMIT | 平台限流 | 请稍后或改定时 |
| NETWORK_ERROR | 网络错误 | 自动重试中 |
| MISSING_IMAGE | 缺少封面 | 请先上传配图 |
| COMPLIANCE_BLOCKED | 敏感词阻断 | 见合规报告 |

#### 4.5.4 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F05-01 | 内容+账号就绪 | 即时发布 | 120s 内 status=succeeded + url |
| TC-F05-02 | 未 confirm | 提交 | 返回 400 |
| TC-F05-03 | 发布失败 | 查 logs | 含 error_code + 时间 |

---

### 4.6 F-06：定时发布

#### 4.6.1 API

```
POST /api/v1/publish
Body: { ..., mode: "scheduled", scheduled_at: ISO8601 }

GET  /api/v1/queue
PATCH /api/v1/publish/:jobId  # 改时间 / 取消 / 提前发布
```

#### 4.6.2 调度规则

| 规则 | 值 |
|------|-----|
| 最小预约时间 | 当前时间 + 5 分钟 |
| 最大预约时间 | 当前时间 + 30 天 |
| 同账号最小间隔 | 4 小时（可配置） |
| 失败重试 | 3 次，间隔 5/15/30 分钟 |
| 时区 | 用户 profile.timezone，默认 Asia/Shanghai |

#### 4.6.3 Worker 行为

1. BullMQ delayed job 到点触发
2. 执行前再次校验账号 status=active
3. 执行 publish connector
4. 失败按策略重试或标记 failed_final + 通知

#### 4.6.4 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F06-01 | 设置定时 | 到点 | ±1 分钟内发布成功 |
| TC-F06-02 | 定时任务 | 取消 | status=cancelled，不再执行 |
| TC-F06-03 | 失败 3 次 | 最终 | status=failed_final + 用户通知 |

---

### 4.7 F-07：发布预览

#### 4.7.1 实现

- 前端纯组件渲染，数据来自 PlatformVariant + 选中 cover image
- 不调用平台 API
- 样式参考平台官方 UI（近似，非像素级）

#### 4.7.2 验收用例

| ID | Given | When | Then |
|----|-------|------|------|
| TC-F07-01 | 小红书 variant | 打开预览 | 展示封面+标题+正文摘要 |
| TC-F07-02 | 公众号 variant | 打开预览 | 展示列表项样式 |

---

### 4.8 F-08：草稿箱

#### 4.8.1 API

```
GET /api/v1/drafts?status=&page=
GET /api/v1/drafts/:id/versions
POST /api/v1/drafts/:id/restore  Body: { version_id }
```

#### 4.8.2 草稿状态

| status | 含义 |
|--------|------|
| draft | 编辑中 |
| ready | 已通过合规，待发布 |
| publishing | 发布中 |
| published | 至少一个平台发布成功 |
| archived | 用户归档 |

#### 4.8.3 版本策略

- 每次 AI 生成/改写创建新版本
- 保留最近 20 个版本
- 支持 diff 查看与恢复

---

### 4.9 F-11：敏感词/合规检测

#### 4.9.1 API

```
POST /api/v1/compliance/scan
Body: { title, body, tags[], platform }
Response: {
  passed: boolean,
  issues: [{ type, word, position, severity, suggestion }]
}
```

#### 4.9.2 规则类型

| type | severity | 行为 |
|------|----------|------|
| forbidden_word | error | 阻断发布 |
| ad_law_risk | warning | 提示，可 override |
| platform_rule | warning | 如小红书外链提示 |
| length_exceeded | error | 阻断发布 |

#### 4.9.3 Override

- error 级默认不可 override
- warning 级 override 需二次确认 + 记录 audit log

---

## 5. 数据模型（MVP）

### 5.1 ER 关系

```
User 1──N PlatformAccount
User 1──N ContentDraft
ContentDraft 1──N DraftVersion
ContentDraft 1──N PlatformVariant
ContentDraft 1──N DraftImage
PlatformVariant 1──N PublishJob
PlatformAccount 1──N PublishJob
```

### 5.2 表结构

#### users

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| email | varchar | unique |
| plan | enum | free, creator, pro, team |
| ai_quota_used | int | 当月已用 |
| ai_quota_limit | int | 默认 5 (free) |
| timezone | varchar | 默认 Asia/Shanghai |
| created_at | timestamptz | |

#### platform_accounts

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK | |
| platform | enum | xhs, wechat_mp |
| nickname | varchar | |
| avatar_url | varchar | |
| auth_token_enc | text | 加密 |
| status | enum | pending, active, expired, error, revoked |
| last_health_check | timestamptz | |
| created_at | timestamptz | |

#### content_drafts

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK | |
| topic | text | 原始选题 |
| platform_targets | jsonb | ["xhs","wechat_mp"] |
| master_title | varchar | |
| master_body | text | |
| master_tags | jsonb | |
| status | enum | draft, ready, publishing, published, archived |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### draft_versions

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| draft_id | uuid FK | |
| title | varchar | |
| body | text | |
| tags | jsonb | |
| source | enum | ai_full, ai_rewrite, manual |
| created_at | timestamptz | |

#### platform_variants

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| draft_id | uuid FK | |
| platform | enum | xhs, wechat_mp |
| title | varchar | |
| body | text | |
| body_html | text | 公众号专用 |
| tags | jsonb | |
| cover_image_id | uuid FK | |
| created_at | timestamptz | |

#### draft_images

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| draft_id | uuid FK | |
| url | varchar | |
| width | int | |
| height | int | |
| role | enum | cover, inline |
| source | enum | ai, upload |
| prompt | text | nullable |
| created_at | timestamptz | |

#### publish_jobs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK | |
| variant_id | uuid FK | |
| account_id | uuid FK | |
| mode | enum | immediate, scheduled |
| scheduled_at | timestamptz | nullable |
| status | enum | queued, running, succeeded, failed, retrying, failed_final, cancelled |
| platform_url | varchar | nullable |
| error_code | varchar | nullable |
| error_message | text | nullable |
| retry_count | int | default 0 |
| created_at | timestamptz | |
| completed_at | timestamptz | nullable |

---

## 6. 平台内容规格（MVP 硬约束）

| 平台 | 标题 | 正文 | 图片 | 标签 |
|------|------|------|------|------|
| 小红书 | ≤20 字 | 建议 ≤1000 字 | 1–9 张，封面 3:4 | 3–10 个 #话题 |
| 微信公众号 | ≤64 字 | 无硬限，建议 800–5000 | 封面 2.35:1 | 无 |

发布前 `compliance/scan` + 适配器双重校验。

---

## 7. 用户流程与 Onboarding

### 7.1 首次发布路径（≤5 步）

1. 注册/登录
2. 连接至少 1 个平台账号
3. 新建创作 → AI 生成
4. 配图 → 适配 → 预览
5. 确认发布

### 7.2 Onboarding 检查点

| 步骤 | 完成条件 | 持久化字段 |
|------|----------|------------|
| 选平台 | 勾选 primary_platform | user.onboarding_step |
| 连账号 | ≥1 account active | |
| 首篇创作 | 生成 1  draft | |
| 首篇发布 | 1 job succeeded | user.first_publish_at |

未完成 Onboarding 时 Dashboard 顶部固定引导条。

---

## 8. 接口与集成

### 8.1 外部依赖

| 服务 | 用途 | 降级 |
|------|------|------|
| LLM API | 创作/适配 | 队列重试 + 用户提示 |
| Image API | 配图 | 允许仅上传 |
| 微信开放平台 | 公众号发布 | 阻断该渠道 |
| Redis | 队列 | 定时发布不可用 |

### 8.2 PublishConnector 接口

```typescript
interface PublishConnector {
  platform: 'xhs' | 'wechat_mp';
  validateAccount(account: PlatformAccount): Promise<HealthResult>;
  publish(input: PublishInput): Promise<PublishResult>;
}

interface PublishInput {
  title: string;
  body: string;
  bodyHtml?: string;
  tags: string[];
  coverImageUrl: string;
  extraImages?: string[];
}

interface PublishResult {
  success: boolean;
  platformUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}
```

### 8.3 事件与通知（MVP 最小集）

| 事件 | 通知方式 |
|------|----------|
| publish succeeded | 页面 toast + logs |
| publish failed_final | 页面 toast + Dashboard 红点 |
| account expired | Dashboard 告警条 |
| scheduled in 15min | 可选浏览器通知（需授权） |

---

## 9. 非功能需求（MVP）

| 类别 | 指标 |
|------|------|
| 性能 | AI P95 < 30s；Publish P95 < 120s；LCP < 2.5s |
| 安全 | HTTPS；Token AES-256；RBAC 用户隔离 |
| 可靠性 | PublishJob 持久化；Worker 幂等（job_id 去重） |
| 合规 | 发布前 confirm 默认 true；自动化风险提示弹窗 |
| 可观测 | 结构化日志；publish 成功率监控；Sentry 错误追踪 |

---

## 10. 埋点与指标

| 事件名 | 触发 | 属性 |
|--------|------|------|
| `draft_created` | 新建草稿 | platform_targets |
| `ai_generate` | AI 生成 | platform, latency_ms, action |
| `ai_generate_adopted` | 进入配图步骤 | draft_id |
| `image_generated` | 配图成功 | platform, source |
| `adapt_completed` | 适配完成 | platforms[] |
| `compliance_scan` | 合规扫描 | passed, issue_count |
| `publish_submitted` | 提交发布 | mode, platforms[] |
| `publish_succeeded` | 发布成功 | platform, latency_ms |
| `publish_failed` | 发布失败 | error_code |
| `onboarding_completed` | 首篇发布成功 | days_since_signup |

**MVP 核心漏斗**：注册 → 连账号 → 首篇生成 → 首篇发布成功

---

## 11. 迭代计划（8 周）

| 周次 | 里程碑 | 交付功能 | 验收 |
|------|--------|----------|------|
| W1 | M0 需求冻结 | 项目脚手架、DB 迁移、登录 | 可注册登录 |
| W2 | M1 创作 | F-01 基础生成、F-08 草稿 | TC-F01-01~03 |
| W3 | M1 创作 | F-01 快捷操作、F-03 配图 | TC-F01-04, TC-F03-01~03 |
| W4 | M2 适配预览 | F-02、F-07、F-11 | TC-F02-01~03, TC-F07 |
| W5 | M3 发布 | F-04 微信连接器、F-05 | 公众号端到端 |
| W6 | M3 发布 | F-04 小红书、F-06 定时 | 双平台端到端 |
| W7 | M4 内测 | Dashboard、Onboarding、修复 | G1, G2 达标 |
| W8 | M5 公测 | Landing、额度限制、监控 | Go-Live Gate 全通过 |

---

## 12. 测试策略

| 层级 | 范围 |
|------|------|
| 单元测试 | 适配规则引擎、合规扫描、状态机 |
| 集成测试 | API + DB + Queue |
| E2E | 创作→发布主路径（Playwright） |
| 连接器测试 | 各平台 sandbox/测试号，≥200 次小红书发布 |
| 内测 | 50 用户，收集首篇发布率 |

---

## 13. 风险与依赖项

| ID | 风险 | MVP 应对 | 负责人 |
|----|------|----------|--------|
| R1 | 小红书发布不稳定 | W5 前完成 spike；备选半自动「复制到剪贴板」 | 后端 |
| R2 | 公众号需认证服务号 | Onboarding 明确账号要求；文档说明 | 产品 |
| R3 | AI 成本超支 | 额度限制 + 小模型路由 | 后端 |
| R4 | 合规误判 | 首版词库保守 + override 机制 | 产品 |

---

## 14. 附录

### 14.1 PRD 功能映射

| PRD | MVP Spec |
|-----|----------|
| F-01 | §4.1 |
| F-02 | §4.2 |
| F-03 | §4.3 |
| F-04 | §4.4 |
| F-05 | §4.5 |
| F-06 | §4.6 |
| F-07 | §4.7 |
| F-08 | §4.8 |
| F-11 | §4.9 |

### 14.2 修订记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-04 | 基于 PRD v1.0 首版 MVP Spec |
