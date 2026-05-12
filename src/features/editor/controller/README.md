# Controller 目录

## 说明

此目录包含 fabric.js 控制点（controls）的自定义配置。

## 实现方式（fabric v6）

### 全局 Controls

在 `index.ts` 中定义全局 controls 配置，在 `Canvas` 初始化后通过 `initControl()` 应用到所有对象。

```typescript
// editor/index.tsx
private _initControls () {
  initControl(); // 设置全局 controls
}
```

### 特定类型 Controls

在各自定义类中通过 `static controls` 定义特定 controls：

| 类型 | 特殊 Controls |
|------|--------------|
| `FText` | 隐藏 mt/mb，只保留 ml/mr 调整宽度 |
| `FLine/FArrow/FTriArrow` | 端点拖拽控制（l1/l2） |

## Controls 功能

### 全局
- 四个顶点（tl, tr, bl, br）：等比缩放
- 四边中点（mt, mb, ml, mr）：调整宽高
- 旋转按钮（mtr）：SVG 图标
- 复制按钮（copy）：SVG 图标
- 删除按钮（del）：SVG 图标

### 鼠标交互
- 悬停控制点：图标高亮
- 点击复制/删除：执行对应操作
