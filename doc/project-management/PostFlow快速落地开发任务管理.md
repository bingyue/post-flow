# PostFlow 快速落地开发任务管理

| 字段 | 内容 |
|------|------|
| 版本 | v1.0 |
| 日期 | 2026-07-05 |
| 依据文档 | [MVP Spec](../spec/MVP-Spec-PostFlow-20260704.md)、[全栈 MVP 方案](../technical/PostFlow全栈MVP开发方案以及方案对比.md) |
| 技术路线 | 方案1：`post-flow` 单仓全栈，Next.js + TypeScript + SQLite |
| 目标 | 将当前 Demo-MOCK 演进为可注册、可登录、可持久化、可演示业务闭环的全栈 MVP |

---

## 1. 状态规范

| 状态 | 含义 |
|------|------|
| `Todo` | 尚未开始 |
| `In Progress` | 正在开发 |
| `Blocked` | 被依赖或外部问题阻塞 |
| `Review` | 已完成开发，待检查/测试 |
| `Done` | 已完成并通过基础验证 |

---

## 2. 优先级规范

| 优先级 | 含义 |
|--------|------|
| `P0` | MVP 必须完成，否则无法上线或演示真实闭环 |
| `P1` | MVP 重要增强，影响体验但不阻塞主流程 |
| `P2` | 后续优化，不进入首轮快速落地 |

---

## 3. 当前阶段总览

| 阶段 | 目标 | 状态 |
|------|------|------|
| M0 Demo-MOCK | 高保真页面 + localStorage Mock 流程 | `Done` |
| M1 全栈基础设施 | Prisma + SQLite + Auth.js | `Done` |
| M2 登录注册真实闭环 | 注册、登录、会话、鉴权保护 | `Done` |
| M3 用户数据持久化 | 草稿、适配版本、图片、发布任务入库 | `Done` |
| M4 业务 API 替换 Mock | 用 Route Handlers 接管核心 CRUD | `Todo` |
| M5 MVP 验收 | lint/build/登录注册/首篇发布闭环 | `Todo` |

---

## 4. 任务编号规则

- `BE-*`：后端 / 数据库 / API / 鉴权
- `FE-*`：前端页面 / 交互 / 状态接入
- `FS-*`：全栈联调任务
- `QA-*`：测试、验收、文档
- `OPS-*`：工程化、部署、环境

---

## 5. 后端任务（Backend）

### 5.1 基础设施与数据库

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-001 | 安装 `prisma`、`@prisma/client`、`next-auth`、`bcryptjs` | P0 | Done | 无 | `package.json` 依赖存在，项目可安装 |
| BE-002 | 初始化 Prisma + SQLite | P0 | Done | BE-001 | 存在 `prisma/schema.prisma` 与 SQLite datasource |
| BE-003 | 配置 `.env.example` | P0 | Done | BE-002 | 包含 `DATABASE_URL`、`AUTH_SECRET` 等变量 |
| BE-004 | 创建首版 migration | P0 | Done | BE-002 | `npx prisma migrate dev` 可执行 |
| BE-005 | 创建 Prisma Client 单例 | P0 | Done | BE-004 | `src/lib/db/prisma.ts` 可被 API 复用 |

### 5.2 用户与鉴权

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-010 | 设计 `User` 表 | P0 | Done | BE-002 | 字段包含 email、passwordHash、plan、aiQuota |
| BE-011 | 实现密码哈希工具 | P0 | Done | BE-001 | 支持 hash/verify，使用 `bcryptjs` |
| BE-012 | 实现 `POST /api/auth/register` | P0 | Done | BE-010, BE-011 | 支持注册、邮箱唯一校验、密码强度校验 |
| BE-013 | 配置 Auth.js Credentials Provider | P0 | Done | BE-010, BE-011 | 支持邮箱密码登录 |
| BE-014 | 实现 JWT session 字段扩展 | P0 | Done | BE-013 | session 中包含 user.id、email、plan |
| BE-015 | 服务端获取当前用户工具 `getCurrentUser()` | P0 | Done | BE-013 | API 可复用并能阻止未登录访问 |

### 5.3 业务数据模型

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-020 | 设计 `PlatformAccount` 表 | P0 | Done | BE-004 | 支持平台、昵称、状态、加密 token 字段 |
| BE-021 | 设计 `ContentDraft` 表 | P0 | Done | BE-004 | 支持 topic、platformTargets、masterTitle/body/tags、status |
| BE-022 | 设计 `DraftVersion` 表 | P1 | Done | BE-021 | 支持版本历史与恢复 |
| BE-023 | 设计 `PlatformVariant` 表 | P0 | Done | BE-021 | 支持 xhs/wechat 独立版本 |
| BE-024 | 设计 `DraftImage` 表 | P0 | Done | BE-021 | 支持 AI/Mock/Upload 图片来源与封面选择 |
| BE-025 | 设计 `PublishJob` 表 | P0 | Done | BE-023, BE-020 | 支持 queued/running/succeeded/failed 等状态 |

### 5.4 API：草稿与 AI 创作

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-030 | 实现 `GET /api/v1/drafts` | P0 | Done | BE-021, BE-015 | 仅返回当前用户草稿 |
| BE-031 | 实现 `POST /api/v1/drafts` | P0 | Done | BE-021, BE-015 | 可创建草稿并写入用户 ID |
| BE-032 | 实现 `PATCH /api/v1/drafts/:id` | P0 | Done | BE-021, BE-015 | 仅可修改自己的草稿 |
| BE-033 | 实现 `POST /api/v1/drafts/:id/generate` | P0 | Todo | BE-021, BE-015 | 调用 DeepSeek 或 Mock fallback，扣减额度 |
| BE-034 | 实现 AI 额度校验 | P0 | Todo | BE-010, BE-033 | 额度不足返回 402 |
| BE-035 | 实现 `GET /api/v1/drafts/:id/versions` | P1 | Done | BE-022 | 返回版本历史 |
| BE-036 | 实现 `POST /api/v1/drafts/:id/restore` | P1 | Todo | BE-022 | 可恢复版本 |

### 5.5 API：平台适配与配图

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-040 | 实现 `POST /api/v1/drafts/:id/adapt` | P0 | Done | BE-023 | 生成小红书/公众号 variants |
| BE-041 | 实现 `PATCH /api/v1/variants/:id` | P0 | Done | BE-023 | 可编辑平台版本 |
| BE-042 | 实现 `POST /api/v1/drafts/:id/images/generate` | P0 | Done | BE-024 | 调用 Seedream 或 Mock fallback |
| BE-043 | 实现 `POST /api/v1/drafts/:id/images/upload` | P0 | Done | BE-024 | 支持图片上传，限制 5MB |
| BE-044 | 实现 `PUT /api/v1/drafts/:id/images/:imageId/select` | P0 | Done | BE-024 | 可选择平台封面 |

### 5.6 API：平台账号与发布

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-050 | 实现 `GET /api/v1/accounts` | P0 | Done | BE-020 | 返回当前用户平台账号 |
| BE-051 | 实现 `POST /api/v1/accounts/connect` Mock 连接 | P0 | Done | BE-020 | 可模拟连接 xhs/wechat |
| BE-052 | 实现 `DELETE /api/v1/accounts/:id` | P0 | Done | BE-020 | 可删除自己的账号 |
| BE-053 | 实现 `POST /api/v1/accounts/:id/refresh` | P0 | Done | BE-020 | 可将 expired 改为 active |
| BE-054 | 实现 `POST /api/v1/publish` | P0 | Done | BE-025 | 创建 immediate/scheduled PublishJob |
| BE-055 | 实现 `GET /api/v1/publish/:jobId` | P0 | Done | BE-025 | 查询发布任务状态 |
| BE-056 | 实现 `GET /api/v1/queue` | P0 | Done | BE-025 | 返回当前用户定时任务 |
| BE-057 | 实现 `PATCH /api/v1/publish/:jobId` | P0 | Done | BE-025 | 支持取消、改时间、提前发布 |
| BE-058 | 实现 Mock PublishConnector | P0 | Done | BE-054 | 2 秒模拟 running → succeeded/failed |

### 5.7 合规、事件与日志

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| BE-060 | 实现 `POST /api/v1/compliance/scan` | P0 | Todo | 无 | 返回 passed + issues |
| BE-061 | 发布前强制合规扫描 | P0 | Todo | BE-054, BE-060 | error 级问题阻断发布 |
| BE-062 | 实现基础事件记录 `EventLog` | P1 | Todo | BE-004 | 可记录 draft_created、publish_succeeded |
| BE-063 | 实现发布日志查询 | P0 | Done | BE-025 | Logs 页面可读取 DB 数据 |

---

## 6. 前端任务（Frontend）

### 6.1 现有 Demo 页面状态

| 编号 | 页面/模块 | 优先级 | 状态 | 说明 |
|------|-----------|--------|------|------|
| FE-001 | Landing `/` | P0 | Done | 已完成高保真 Demo |
| FE-002 | Login `/login` | P0 | Done | 当前为 Mock 登录，需接真实鉴权 |
| FE-003 | Register `/register` | P0 | Done | 当前为 Mock 注册，需接真实注册 |
| FE-004 | Dashboard `/dashboard` | P0 | Done | 当前使用 localStorage Mock |
| FE-005 | Studio 新建 `/studio/new` | P0 | Done | 当前使用 localStorage Mock |
| FE-006 | Studio 编辑 `/studio/[draftId]` | P0 | Done | 当前使用 localStorage Mock |
| FE-007 | 配图 Lab | P0 | Done | 当前使用 Mock/Seedream fallback |
| FE-008 | 平台适配 | P0 | Done | 当前前端适配规则已实现 |
| FE-009 | 发布预览 | P0 | Done | 小红书/公众号预览已实现 |
| FE-010 | 发布确认 | P0 | Done | 当前 Mock 发布已实现 |
| FE-011 | Drafts | P0 | Done | 当前 localStorage Mock |
| FE-012 | Queue | P0 | Done | 当前 Mock 队列 |
| FE-013 | Accounts | P0 | Done | 当前 Mock 账号连接 |
| FE-014 | Logs | P0 | Done | 当前 Mock 日志 |
| FE-015 | Settings | P0 | Done | 已支持 DeepSeek/Seedream 临时配置 |

### 6.2 登录注册真实化

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| FE-020 | 改造注册表单字段与校验 | P0 | Done | BE-012 | 邮箱/密码/确认密码校验完整 |
| FE-021 | 注册页接入 `POST /api/auth/register` | P0 | Done | BE-012 | 注册成功后自动登录或跳转登录 |
| FE-022 | 改造登录页接入 Auth.js `signIn` | P0 | Done | BE-013 | 登录成功跳 Dashboard，失败有提示 |
| FE-023 | 登录/注册错误展示 | P0 | Done | FE-021, FE-022 | 重复邮箱、密码错误可读 |
| FE-024 | 已登录访问登录/注册页自动跳转 | P1 | Done | BE-013 | 不重复进入 auth 页面 |

### 6.3 鉴权与页面数据接入

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| FE-030 | `(app)` 布局切换为真实 session 鉴权 | P0 | Done | BE-013 | 未登录跳 `/login` |
| FE-031 | TopBar 显示真实用户信息 | P0 | Done | BE-014 | 显示当前用户 email/plan |
| FE-032 | 移除关键路径 Mock 登录依赖 | P0 | Done | FE-030 | 登录态不再依赖 DemoStore.user |
| FE-033 | 增加退出登录功能 | P0 | Done | BE-013 | 点击退出后清 session 并回登录页 |

### 6.4 业务页面从 Mock 切换 API

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| FE-040 | Dashboard 接入 `/api/v1/drafts`、`/api/v1/queue`、日志 API | P0 | Done | BE-030, BE-056, BE-063 | 刷新后数据仍存在 |
| FE-041 | Drafts 接入 DB 草稿列表 | P0 | Done | BE-030 | 仅显示当前用户草稿 |
| FE-042 | Studio 新建接入 `POST /api/v1/drafts` | P0 | Done | BE-031 | 创建后进入真实 draftId |
| FE-043 | Studio 编辑接入 `PATCH /api/v1/drafts/:id` | P0 | Done | BE-032 | 保存后刷新不丢失 |
| FE-044 | AI 快捷操作接入 `POST /api/v1/drafts/:id/generate` | P0 | Done | BE-033 | 额度不足展示 402 提示 |
| FE-045 | 配图页接入 images API | P0 | Done | BE-042, BE-043, BE-044 | 图片刷新不丢失 |
| FE-046 | 适配页接入 variants API | P0 | Done | BE-040, BE-041 | 适配版本入库 |
| FE-047 | 发布页接入 `POST /api/v1/publish` | P0 | Done | BE-054 | 发布后进入 Logs/Queue |
| FE-048 | Queue 接入真实任务 API | P0 | Done | BE-056, BE-057 | 取消/提前发布持久化 |
| FE-049 | Accounts 接入真实账号 API | P0 | Done | BE-050~BE-053 | 账号状态刷新后保留 |
| FE-050 | Logs 接入真实发布日志 | P0 | Done | BE-063 | 显示当前用户发布记录 |

### 6.5 Onboarding 与体验补全

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| FE-060 | Onboarding 状态入库 | P1 | Todo | BE-010 | 刷新后引导进度保留 |
| FE-061 | Dashboard 顶部引导条 | P1 | Todo | FE-060 | 未完成首篇发布时提示 |
| FE-062 | Toast/错误反馈统一组件化 | P1 | Todo | 无 | API 错误统一展示 |
| FE-063 | 空状态与加载态补齐 | P1 | Todo | FE-040~FE-050 | 所有页面有 loading/empty/error |

---

## 7. 全栈联调任务（Fullstack）

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| FS-001 | 注册 → 登录 → Dashboard 全链路联调 | P0 | Done | FE-020~FE-033, BE-010~BE-015 | 新用户可进入 Dashboard |
| FS-002 | 首篇草稿创建链路联调 | P0 | Done | FE-042, BE-031 | DB 中产生 draft |
| FS-003 | AI 生成链路联调 | P0 | Done | FE-044, BE-033 | DeepSeek 成功或 Mock fallback |
| FS-004 | 配图链路联调 | P0 | Done | FE-045, BE-042 | Seedream 成功或 Mock fallback |
| FS-005 | 适配链路联调 | P0 | Done | FE-046, BE-040 | 生成 xhs/wechat variants |
| FS-006 | 即时发布链路联调 | P0 | Done | FE-047, BE-054, BE-058 | job running → succeeded |
| FS-007 | 定时发布链路联调 | P0 | Done | FE-048, BE-056, BE-057 | 可取消、提前发布 |
| FS-008 | 用户数据隔离联调 | P0 | Done | 全部业务 API | 用户 A 看不到用户 B 数据 |

---

## 8. 测试与验收任务（QA）

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| QA-001 | lint 检查 | P0 | Done | 全部开发任务 | `npm run lint` 通过 |
| QA-002 | build 检查 | P0 | Done | 全部开发任务 | `npm run build` 通过 |
| QA-003 | 注册登录手工用例 | P0 | Done | FS-001 | 覆盖成功/失败/重复邮箱 |
| QA-004 | MVP 主流程手工用例 | P0 | Done | FS-002~FS-007 | 完整首篇发布闭环可走通 |
| QA-005 | 用户隔离手工用例 | P0 | Done | FS-008 | 多账号数据互不串 |
| QA-006 | 错误状态回归 | P1 | Done | 业务 API | API 错误均有前端提示 |

---

## 9. 工程与文档任务（OPS）

| 编号 | 任务 | 优先级 | 状态 | 依赖 | 验收标准 |
|------|------|--------|------|------|----------|
| OPS-001 | 更新 `README.md` 启动方式 | P0 | Done | BE-001~BE-004 | 包含 DB 初始化与 migration 命令 |
| OPS-002 | 新增 `.env.example` | P0 | Done | BE-003 | 能指导本地启动 |
| OPS-003 | 增加 `prisma` 常用脚本 | P0 | Done | BE-002 | `db:migrate`、`db:studio` 可用 |
| OPS-004 | 记录 Mock → DB 切换策略 | P1 | Done | FE-040~FE-050 | 文档说明清晰 |
| OPS-005 | 更新 MVP Spec 差异说明 | P1 | Done | 全栈落地完成 | 记录 SQLite/Auth.js 实际选择 |

---

## 10. 推荐实施顺序

1. `BE-001` ~ `BE-015`：先完成 SQLite + Auth.js + 注册登录
2. `FE-020` ~ `FE-033`：前端登录注册真实化
3. `BE-020` ~ `BE-025`：补齐业务模型
4. `BE-030` ~ `BE-063`：按模块实现业务 API
5. `FE-040` ~ `FE-050`：逐页替换 Mock 数据源
6. `FS-001` ~ `FS-008`：端到端联调
7. `QA-001` ~ `QA-006`：验收

---

## 11. MVP 里程碑

### Milestone 1：真实登录注册

| 目标 | 关联任务 | 状态 |
|------|----------|------|
| 用户可注册登录，登录态可持久化 | BE-001~BE-015, FE-020~FE-033, FS-001 | Done |

### Milestone 2：草稿与 AI 创作持久化

| 目标 | 关联任务 | 状态 |
|------|----------|------|
| 草稿/版本/AI 生成入库 | BE-020~BE-036, FE-040~FE-044, FS-002~FS-003 | Done |

### Milestone 3：配图、适配、发布持久化

| 目标 | 关联任务 | 状态 |
|------|----------|------|
| 图片、平台版本、发布任务入库 | BE-040~BE-063, FE-045~FE-050, FS-004~FS-007 | Done |

### Milestone 4：MVP 验收

| 目标 | 关联任务 | 状态 |
|------|----------|------|
| 完整主流程可演示、构建通过 | QA-001~QA-006, OPS-001~OPS-005 | Done |

---

## 12. 进度维护规则

1. 每完成一个任务，更新对应 `状态`。
2. 如果开发中发现任务粒度过大，拆出子任务并保持编号前缀。
3. 如果任务被技术约束阻塞，标为 `Blocked` 并在“依赖”列说明阻塞源。
4. 每个 Milestone 完成后，必须跑一次：

```bash
cd post-flow
npm run lint
npm run build
```

---

## 13. 2026-07-05 M3 联调记录

- 已完成 SQLite/Prisma 持久化模型与 API 接入：草稿、版本、平台适配版本、图片、平台账号、发布任务、队列、发布日志均按当前登录用户入库。
- 前端保留现有 `useDemoStore` 调用方式，初始化从 `/api/v1/bootstrap` 读取 DB 状态，关键写操作同步调用业务 API。
- 已用真实 Auth.js 登录会话验证 M3 入库链路：`draft=true`、`versions=1`、`variants=1`、`images=1`、`publishJobs=1`、`userScoped=true`。
- `npm run lint` 已通过。
- `npm run build` 已通过。

## 14. 2026-07-05 M4/MVP 验收修复记录

- 新建创作已切换到服务端业务 API：先创建草稿，再通过 `/api/v1/drafts/:id/generate` 完成 AI 生成、额度扣减、版本写入和草稿更新。
- 发布模拟已由服务端 `/api/v1/publish/:jobId/simulate` 持久化驱动，Queue「立即发布」与发布页即时发布不再依赖纯前端定时器。
- 收敛 `DemoStoreContext` 与 DB 的边界：真实登录态以 `/api/v1/bootstrap` 为准，清理旧 localStorage 数据闪现和跨用户污染风险。
- 修复后端归属校验：平台版本 upsert 按 `draftId + platform` 归属处理，发布任务创建校验 draft、variant、account 均属于当前用户且平台一致。
- README 已更新为 Auth.js + Prisma + SQLite 全栈 MVP 启动说明，并记录 Mock 平台连接/发布边界。

