---
name: zine-log-code-reform
overview: 对 zine-log 项目的 src/features 和 src/lib 进行代码重构，检查代码错误、标记未实现功能、删除冗余代码，并记录缺失的测试用例。
todos:
  - id: create-reform-md
    content: 创建 reform.md 记录重构计划和问题清单
    status: completed
  - id: fix-types
    content: 修复类型定义不一致问题（GalleryImage/LibraryImage）
    status: completed
    dependencies:
      - create-reform-md
  - id: fix-reducer-test
    content: 修复 editor-reducer.test.ts 中失败的测试用例（fill-example action）
    status: completed
    dependencies:
      - fix-types
  - id: remove-unused-templates
    content: 删除未使用的模板文件（editorial.ts、l-shape.ts、poster.ts）
    status: completed
    dependencies:
      - create-reform-md
  - id: clean-console
    content: 清理 console.log 和 console.error，替换为合适的错误处理
    status: completed
    dependencies:
      - create-reform-md
  - id: mark-unimplemented
    content: 标记未实现功能（undo/redo、自定义颜色选择器、onSaveDraft）
    status: completed
    dependencies:
      - create-reform-md
  - id: remove-ring-scale
    content: 移除 RightPanel 中未使用的 ringScale 参数
    status: completed
    dependencies:
      - create-reform-md
  - id: record-missing-tests
    content: 记录缺失测试的模块（export、preview3d、rendering）
    status: completed
    dependencies:
      - create-reform-md
  - id: update-agents-md
    content: 更新 AGENTS.md 添加重构后的项目规范
    status: completed
    dependencies:
      - create-reform-md
---

## 项目概述

Zine Log 是一个图文排版工具项目，由不同 AI + 人工协作开发，为了快速上线未严格遵循规范。需要对 `src/features` 和 `src/lib` 下的代码进行重构。

## 重构目标

1. **代码错误修复**：修复类型不一致、逻辑错误等问题
2. **TODO/FIXME 标记**：识别并标记未实现功能
3. **冗余代码删除**：清理未使用的模板、重复代码
4. **测试用例记录**：识别缺失测试的模块并记录
5. **reform.md 记录**：执行过程中记录所有问题和改进点

## 发现的主要问题

### 代码错误

- `editor-reducer.test.ts` 第100行测试期望模板变为 "l-shape"，但 reducer 缺少对应处理逻辑
- `filesToLibraryImages` 返回 `LibraryImage[]` 但包含 `selected: true`，与类型定义不一致
- `GalleryImage` 和 `LibraryImage` 类型定义存在字段差异

### TODO/FIXME 标记

- `folded-strip.tsx:61` - 旋转动画 TODO（代码已注释）

### 冗余/未使用代码

- `editorial.ts`、`l-shape.ts`、`poster.ts` 模板未在主流程中使用
- `render-template.ts` 的 `currentDimensions` 函数返回固定值，与 template 参数无关
- `RightPanel` 接收 `ringScale` 但未在 UI 中使用

### 未实现功能

- `TopBar` 的 undo/redo/fullscreen/export 回调未实现
- `RightPanel` 的自定义颜色选择器为空点击处理器
- `Editor.tsx` 中的 `onSaveDraft` 未实现
- `console.log` 需要移除或转换为合适的错误处理

### 测试缺失

- `App.test.tsx` 几乎为空
- 缺少 export、preview3d、rendering 模块的测试

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS + CSS Modules
- **3D 渲染**: React Three Fiber + Three.js
- **测试**: Vitest
- **组件库**: shadcn/ui

## 重构策略

### 1. 类型系统修复

- 统一 `GalleryImage` 和 `LibraryImage` 类型定义
- 移除冗余字段，确保类型一致性

### 2. 代码清理

- 删除未使用的模板文件（editorial.ts、l-shape.ts、poster.ts）
- 移除调试用的 `console.log`
- 清理注释掉的代码

### 3. 错误处理

- 将 `console.error` 转换为用户友好的错误提示
- 添加适当的错误边界

### 4. 测试补充

- 为关键模块添加单元测试
- 补充缺失的测试用例

### 5. 文档记录

- 创建 reform.md 记录所有问题和改进点
- 标记未实现功能供后续开发