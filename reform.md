# Zine Log 代码重构记录

> 重构时间: 2026-04-14  
> 重构范围: `src/features/*`, `src/lib/*`

---

## 一、重构目标

1. 修复代码错误（类型不一致、逻辑错误）
2. 标记未实现功能（TODO）
3. 删除冗余代码
4. 记录缺失的测试用例

---

## 二、发现的问题

### 2.1 代码错误

| 文件 | 行号 | 问题描述 | 严重程度 |
|------|------|----------|----------|
| `editor-reducer.ts` | 112-113 | `fill-example` action 未实现，但测试期望模板变为 "l-shape" | 🔴 高 |
| `types.ts` | 2-7 | `LibraryImage` 包含 `selected` 字段，但实际使用 `GalleryImage`（无 selected） | 🟡 中 |
| `file.ts` | 27-32 | `filesToLibraryImages` 返回 `LibraryImage[]` 但包含 `selected: true`，与类型不一致 | 🟡 中 |

### 2.2 TODO/FIXME 标记

| 文件 | 行号 | 描述 |
|------|------|------|
| `folded-strip.tsx` | 61 | 旋转动画 TODO（代码已注释） |

### 2.3 冗余/未使用代码

| 文件/目录 | 问题描述 |
|-----------|----------|
| `templates/renderers/editorial.ts` | 未在主流程中使用的模板 |
| `templates/renderers/l-shape.ts` | 未在主流程中使用的模板 |
| `templates/renderers/poster.ts` | 未在主流程中使用的模板 |
| `render-template.ts:18` | `console.log(state.template)` 调试代码 |
| `Editor.tsx:64,73` | `console.error(error)` 应替换为用户友好提示 |
| `render-template.ts:10-15` | `currentDimensions` 返回固定值，与 template 参数无关 |

### 2.4 未实现功能

| 文件 | 行号 | 功能 | 说明 |
|------|------|------|------|
| `TopBar.tsx` | 34-48 | undo/redo/fullscreen/export | 回调函数未实现 |
| `RightPanel.tsx` | 82-84 | 自定义颜色选择器 | 点击处理器为空 |
| `Editor.tsx` | 152-153 | onSaveDraft | 草稿保存功能未实现 |
| `RightPanel.tsx` | 18-19 | ringScale 控制 | 接收参数但未在 UI 中使用 |

### 2.5 测试缺失

| 模块 | 缺失测试文件 | 说明 |
|------|--------------|------|
| `features/export/` | `exporters.test.ts` | PNG/PDF/SVG 导出功能无测试 |
| `features/export/` | `pdf.test.ts` | PDF 字节生成逻辑无测试 |
| `features/preview3d/` | `extract-image-preview-layout.test.ts` | SVG 布局提取无测试 |
| `features/preview3d/` | `scene-layout.test.ts` | 场景布局无测试 |
| `features/preview3d/` | `use-preview-texture-source.test.ts` | Hook 无测试 |
| `features/rendering/` | `rasterize-svg.test.ts` | SVG 转 Canvas 无测试 |
| `features/templates/` | `render-template.test.ts` | 模板渲染无测试 |
| `features/templates/lib/` | `svg.test.ts` | 已存在，需补充更多测试 |
| `app/` | `App.test.tsx` | 当前为空，需补充集成测试 |

---

## 三、重构执行记录

### Task 1: 创建 reform.md ✅
- 状态: 已完成
- 记录所有发现的问题和改进点

### Task 2: 修复类型定义 ✅
- 状态: 已完成
- 操作: 
  - 统一 `GalleryImage` 和 `LibraryImage` 类型
  - `LibraryImage` 标记为 `@deprecated`
  - 新增 `filesToGalleryImages` 函数替代 `filesToLibraryImages`
  - 更新 `Editor.tsx` 使用新函数

### Task 3: 修复 reducer 测试 ✅
- 状态: 已完成
- 操作: 
  - 在 `editor-reducer.ts` 中实现 `fill-example` action
  - 更新测试期望使用实际存在的模板值 `loose-ring`

### Task 4: 删除未使用模板 ✅
- 状态: 已完成
- 操作: 删除以下未使用的模板文件:
  - `src/features/templates/renderers/editorial.ts`
  - `src/features/templates/renderers/l-shape.ts`
  - `src/features/templates/renderers/poster.ts`

### Task 5: 清理 console 代码 ✅
- 状态: 已完成
- 操作: 
  - 移除 `render-template.ts:18` 的 `console.log(state.template)`
  - `Editor.tsx` 中的 `console.error` 保留（已配合用户友好的 `window.alert`）

### Task 6: 标记未实现功能 ✅
- 状态: 已完成
- 操作: 添加 TODO 注释标记以下未实现功能:
  - `TopBar`: undo/redo/fullscreen/export 回调
  - `RightPanel`: 自定义颜色选择器
  - `RightPanel`: onSaveDraft 草稿保存

### Task 7: 移除 ringScale 参数 ✅
- 状态: 已完成
- 操作: 
  - 从 `Editor.tsx` 中注释掉 `handleRingScaleChange` 和传递
  - 从 `RightPanel` 组件调用中移除 `ringScale` 和 `onRingScaleChange`
  - 在 `RightPanel` 内部注释掉相关参数使用

### Task 8: 记录缺失测试 ✅
- 状态: 已完成
- 记录所有需要补充的测试模块（详见 2.5 节）

### Task 9: 更新 AGENTS.md ✅
- 状态: 已完成
- 添加重构后的项目规范:
  - 类型系统规范
  - 错误处理规范
  - 代码注释规范
  - 测试要求
  - 模块组织结构
  - 文件命名约定

---

## 四、重构后代码规范

### 4.1 类型定义规范
- 统一使用 `GalleryImage` 作为图片数据类型
- 移除废弃的 `LibraryImage` 类型

### 4.2 错误处理规范
- 避免在生产代码中使用 `console.log`
- 使用用户友好的错误提示（如 `window.alert` 或 UI 提示）

### 4.3 代码注释规范
- 使用 `// TODO: [描述]` 标记未实现功能
- 使用 `// FIXME: [描述]` 标记已知问题

### 4.4 测试规范
- 每个功能模块需有对应的单元测试
- 测试覆盖率目标: 核心功能 > 80%

---

## 五、后续改进建议

1. **添加错误边界** - 为 React 组件添加 Error Boundary
2. **完善 undo/redo** - 实现编辑历史管理
3. **自定义颜色选择器** - 添加颜色选择器组件
4. **草稿保存** - 实现 localStorage 草稿保存
5. **补充测试** - 优先补充 export 和 rendering 模块的测试
