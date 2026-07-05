# PostFlow 管理端 MVP 产品功能设计

| 字段 | 内容 |
|------|------|
| 版本 | v2.0 |
| 日期 | 2026-07-05 |
| 设计原则 | 单管理员账号、最小后台、复用用户端存储 |
| 技术路线 | 继续在 `post-flow` 单仓 Next.js 全栈项目内实现 |

---

## 1. 设计结论

管理端 MVP 不做复杂 RBAC，不拆仓，不新增独立后端。

当前阶段只需要一个 **Super Admin 管理入口**：

- 复用现有 Auth.js 登录。
- 在现有 `User` 表增加 `isAdmin` 字段。
- 管理端页面统一放在 `/admin` 下。
- 管理端 API 统一放在 `/api/admin/*` 下。
- 所有管理端能力直接读取和操作现有 SQLite / Prisma 数据。

这能最快满足“查看注册用户、订单信息、付费信息、任务信息”的需求，同时避免过早引入多角色权限、独立后台服务和复杂财务系统。

---

## 2. MVP 功能范围

### 2.1 管理端页面

| 路由 | 页面 | MVP 能力 |
|------|------|----------|
| `/admin` | 管理概览 | 查看用户数、付费用户数、订单收入、发布任务状态 |
| `/admin/users` | 用户列表 | 查看注册用户、套餐、额度、草稿数、发布任务数 |
| `/admin/users/[userId]` | 用户详情 | 查看用户资料、草稿、平台账号、发布任务；调整套餐和额度 |
| `/admin/orders` | 订单/付费 | 查看订单和支付记录；创建手工订单；标记支付成功 |
| `/admin/tasks` | 任务中心 | 查看发布任务；按状态筛选；取消 queued/running 任务 |

### 2.2 不做项

| 不做 | 原因 |
|------|------|
| 多管理员角色 | MVP 只有一个管理员账号即可 |
| RBAC 权限矩阵 | 当前没有复杂组织协作需求 |
| 独立管理后台仓库 | 会增加开发和部署成本 |
| 真实支付接入 | 先用手工订单验证商业化流程 |
| 完整财务对账 | 后续接入真实支付后再做 |
| 管理端登录页 | 复用现有 `/login` |

---

## 3. 权限设计

### 3.1 数据模型

在现有 `User` 表增加：

```prisma
isAdmin Boolean @default(false)
```

管理员本质上仍是普通用户账号，只是拥有管理后台权限。

### 3.2 管理员创建方式

MVP 推荐两种方式：

1. 注册时如果邮箱命中环境变量 `ADMIN_EMAILS`，自动创建为管理员。
2. 本地开发可通过 Prisma Studio 或 SQL 手动把 `isAdmin` 改为 `true`。

`.env` 示例：

```bash
ADMIN_EMAILS="admin@postflow.local,founder@example.com"
```

### 3.3 权限校验

新增服务端工具：

```ts
requireAdminUser()
```

校验逻辑：

1. 必须已登录。
2. 当前用户 `isAdmin = true`。
3. 否则返回 403 或跳转到 `/dashboard`。

---

## 4. 数据模型补充

当前已有：

- `User`
- `PlatformAccount`
- `ContentDraft`
- `DraftVersion`
- `PlatformVariant`
- `DraftImage`
- `PublishJob`

管理端 MVP 新增最小商业化模型：

### 4.1 Order

| 字段 | 说明 |
|------|------|
| `id` | 订单 ID |
| `userId` | 用户 ID |
| `orderNo` | 订单号 |
| `productType` | `subscription` / `ai_credit` |
| `plan` | 套餐，可为空 |
| `amount` | 金额，单位分 |
| `currency` | 默认 `CNY` |
| `status` | `pending` / `paid` / `cancelled` / `refunded` |
| `channel` | `manual` / `wechat_pay` / `alipay` / `stripe` |
| `paidAt` | 支付时间 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

### 4.2 Payment

| 字段 | 说明 |
|------|------|
| `id` | 支付记录 ID |
| `orderId` | 订单 ID |
| `userId` | 用户 ID |
| `provider` | 支付渠道 |
| `amount` | 支付金额，单位分 |
| `status` | `pending` / `succeeded` / `failed` / `refunded` |
| `providerTradeNo` | 第三方流水号，MVP 可空 |
| `failureReason` | 支付失败原因 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

---

## 5. API 设计

| API | 方法 | 说明 |
|-----|------|------|
| `/api/admin/overview` | GET | 管理概览指标 |
| `/api/admin/users` | GET | 用户列表，支持邮箱搜索 |
| `/api/admin/users/:id` | GET | 用户详情 |
| `/api/admin/users/:id` | PATCH | 调整用户套餐、AI 额度 |
| `/api/admin/orders` | GET | 订单列表 |
| `/api/admin/orders` | POST | 创建手工订单 |
| `/api/admin/orders/:id/mark-paid` | POST | 标记订单已支付，并同步用户套餐/额度 |
| `/api/admin/tasks` | GET | 发布任务列表 |
| `/api/admin/tasks/:id/cancel` | POST | 取消发布任务 |

---

## 6. 页面功能说明

### 6.1 `/admin` 管理概览

展示：

- 注册用户数
- 付费用户数
- 今日新增用户
- 订单收入
- 发布任务数
- 发布成功率
- 失败任务数
- AI 额度使用量

### 6.2 `/admin/users` 用户列表

展示：

- 邮箱
- 套餐
- AI 额度
- 注册时间
- 草稿数
- 平台账号数
- 发布任务数

操作：

- 搜索邮箱
- 进入用户详情

### 6.3 `/admin/users/[userId]` 用户详情

展示：

- 基础信息
- 套餐与额度
- 最近草稿
- 平台账号
- 发布任务
- 订单记录

操作：

- 调整套餐
- 调整 AI 额度上限

### 6.4 `/admin/orders` 订单/付费

展示：

- 订单号
- 用户邮箱
- 商品类型
- 套餐
- 金额
- 状态
- 支付渠道
- 创建时间

操作：

- 创建手工订单
- 标记订单已支付

标记已支付后：

- `Order.status = paid`
- 创建 `Payment`
- 同步 `User.plan`
- 如果是套餐订单，同步 `aiQuotaLimit`

### 6.5 `/admin/tasks` 任务中心

展示：

- 发布任务 ID
- 用户邮箱
- 平台
- 标题
- 模式
- 状态
- 定时时间
- 完成时间
- 错误信息

操作：

- 按状态筛选
- 取消 queued/running 任务

---

## 7. MVP 验收标准

| 验收项 | 标准 |
|--------|------|
| 管理员访问 | `isAdmin=true` 用户可访问 `/admin` |
| 普通用户访问 | 普通用户访问 `/admin` 被拒绝或跳转 |
| 用户列表 | 能看到注册用户、套餐、额度、草稿数、任务数 |
| 用户详情 | 能看到用户草稿、账号、发布任务、订单 |
| 套餐调整 | 管理员可调整用户 plan |
| 额度调整 | 管理员可调整用户 AI 额度上限 |
| 订单管理 | 可创建手工订单并标记支付成功 |
| 任务管理 | 可查看发布任务并取消任务 |
| 数据复用 | 所有数据来自现有 Prisma / SQLite，不使用独立存储 |

---

## 8. 建议实施顺序

1. 扩展 Prisma schema：`User.isAdmin`、`Order`、`Payment`。
2. Auth.js session 增加 `isAdmin`。
3. 实现 `requireAdminUser()`。
4. 新增 `/api/admin/*` 管理 API。
5. 新增 `/admin` 管理端布局和页面。
6. 跑迁移、lint、build 和管理端 smoke test。

---

## 9. 后续扩展

如果后续进入公测或真实商业化，再考虑：

- 多管理员角色。
- RBAC 权限矩阵。
- 真实支付渠道。
- 退款与发票。
- 管理操作审计日志。
- 独立后台 worker。
- Postgres + 对象存储 + 队列。

当前阶段不建议分仓，也不建议拆独立后台服务。

