# PostFlow 文档 Workspace

`doc/` 按文档用途拆分，根目录只保留本索引，不再直接堆放业务文档。

| 目录 | 用途 | 当前文档 |
|------|------|----------|
| `prd/` | 产品需求、用户场景、功能边界 | [PRD-PostFlow-20260704.md](prd/PRD-PostFlow-20260704.md) |
| `spec/` | MVP 功能规格、验收标准、接口/流程规格 | [MVP-Spec-PostFlow-20260704.md](spec/MVP-Spec-PostFlow-20260704.md) |
| `technical/` | 技术方案、架构对比、工程说明 | [PostFlow全栈MVP开发方案以及方案对比.md](technical/PostFlow全栈MVP开发方案以及方案对比.md) |
| `project-management/` | 任务拆解、里程碑、验收进度、测试方案 | [PostFlow快速落地开发任务管理.md](project-management/PostFlow快速落地开发任务管理.md)、[PostFlow完整功能测试方案.md](project-management/PostFlow完整功能测试方案.md) |
| `business-plan/` | 商业模式、定价、增长假设、融资/资源需求 | [商业计划索引](business-plan/README.md) |
| `admin/` | 管理端产品设计、权限、运营后台规划 | [PostFlow管理端MVP产品功能设计.md](admin/PostFlow管理端MVP产品功能设计.md) |

## 维护规则

1. 新增文档先判断类型，再放入对应 workspace。
2. 跨目录引用使用相对路径，例如 `../spec/...`。
3. README 只维护索引和规则，不承载大段产品正文。
4. 废弃或历史说明放入 `technical/`，并在文件名中标明用途。
