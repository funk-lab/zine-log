# Zine Editor - 轻量级图像编辑器

基于 Fabritor 重构的新一代图像编辑器，采用**创建与编辑分离**的架构设计，使用砂岩暖调设计风格。

## 架构设计

### 核心理念

- **创建在左，编辑在右**：左侧负责"新增什么"，右侧负责"怎么改"
- **自动切换模式**：创建完成后自动回到选择模式，方便立即编辑
- **视觉反馈**：左侧图标高亮显示当前激活工具

### 布局结构

```
┌─────────────────────────────────────────────────────────┐
│                        Header                            │
├──────────────┬────────────────────────┬─────────────────┤
│              │                        │                 │
│  左侧工具栏    │       中间画布          │   右侧属性面板   │
│  (可展开面板)   │                        │   (编辑属性)    │
│              │                        │                 │
│ ┌──────────┐ │                        │  未选中时：     │
│ │ T 文字    │ │                        │  - 画布设置    │
│ ├──────────┤ │                        │                 │
│ │ ▲ 形状    │ │                        │  选中文字时：    │
│ ├──────────┤ │                        │  - 字体/大小    │
│ │ 🖌️ 画笔   │ │                        │  - 颜色/样式    │
│ ├──────────┤ │                        │                 │
│ │ 😊 表情   │ │                        │  选中形状时：    │
│ ├──────────┤ │                        │  - 填充/边框    │
│ │ 🖼️ 图片   │ │                        │  - 圆角/描边    │
│ └──────────┘ │                        │                 │
│              │                        │  选中图片时：    │
│              │                        │  - 替换/翻转    │
│              │                        │                 │
└──────────────┴────────────────────────┴─────────────────┘
```

## 文件结构

```
src/zine-editor/
├── index.tsx                      # 主入口组件
├── components/
│   ├── Header.tsx                 # 顶部导航栏
│   ├── LeftSidebar.tsx           # 左侧可展开工具栏
│   ├── Canvas.tsx                # 中间画布区
│   ├── RightPanel.tsx            # 右侧属性面板容器
│   ├── StatusBar.tsx             # 底部状态栏
│   ├── left-panels/              # 左侧展开面板（创建功能）
│   │   ├── TextTemplate.tsx      # 文字模板
│   │   ├── ShapePicker.tsx       # 形状库
│   │   ├── BrushSettings.tsx     # 画笔设置
│   │   ├── EmojiPicker.tsx       # 表情库
│   │   └── ImagePicker.tsx      # 图片选择（本地/网络）
│   └── setters/                  # 右侧属性编辑器（编辑功能）
│       ├── index.tsx             # 入口：根据类型动态组合setter
│       ├── common/               # 通用setter
│       │   ├── PositionSetter.tsx
│       │   ├── SizeSetter.tsx
│       │   ├── RotationSetter.tsx
│       │   ├── OpacitySetter.tsx
│       │   ├── AlignSetter.tsx
│       │   └── LayerSetter.tsx
│       ├── text/                 # 文字专用setter
│       │   ├── FontSetter.tsx
│       │   ├── TextStyleSetter.tsx
│       │   ├── TextLayoutSetter.tsx
│       │   └── TextEffectSetter.tsx
│       ├── shape/                # 形状专用setter
│       │   ├── FillSetter.tsx
│       │   ├── BorderSetter.tsx
│       │   └── CornerSetter.tsx
│       ├── brush/                # 画笔专用setter
│       │   └── BrushPreview.tsx
│       ├── image/                # 图片专用setter
│       │   └── ImageSetter.tsx
│       └── canvas/               # 画布设置setter
│           └── CanvasSetter.tsx
└── styles/
    ├── base.css                  # 基础样式变量
    ├── layout.css                # 布局样式
    └── panels.css                # 面板样式
```

## 设计系统

### 色彩

| 变量 | 色值 | 用途 |
|------|------|------|
| `--zine-bg` | `#F7F6F3` | 主背景 |
| `--zine-brand` | `#C8773A` | 品牌色 |
| `--zine-brand-hover` | `#B56A30` | 品牌悬停 |
| `--zine-brand-light` | `#F5E6D8` | 品牌浅色 |
| `--zine-select` | `#2D6BE4` | 选中色 |
| `--zine-text-primary` | `#1A1714` | 文字主色 |
| `--zine-text-secondary` | `#6B6560` | 文字次色 |
| `--zine-text-muted` | `#9C9790` | 文字弱色 |
| `--zine-border` | `#E4E1DA` | 边框色 |
| `--zine-border-2` | `#CCC8C0` | 边框深色 |
| `--zine-surface` | `#FFFFFF` | 表面色 |
| `--zine-surface-2` | `#F5F4F0` | 表面次色 |

### 布局

- 三栏结构：左侧工具栏(64px) + 中间画布(自适应) + 右侧面板(280px)
- 左侧面板展开宽度：280px
- 顶部导航栏(52px) + 底部状态栏(26px)

## 功能特性

### 1. 画布设置
- 预设比例（16:9、4:3、3:4、1:1、9:16、自定义）
- 画布尺寸调整
- 背景色设置

### 2. 文字工具
- **创建**：4 款预设模板（标题、副标题、正文、描边文字）
- **编辑**：字体、字号、颜色、样式（B/I/U/S）、对齐、行距、字间距、描边、阴影

### 3. 形状工具
- **创建**：矩形、圆形、三角形、星形、心形、线条等
- **编辑**：填充色、边框、圆角

### 4. 画笔工具
- **创建**：铅笔、马克笔模式
- **设置**：颜色、粗细、透明度、平滑度
- **编辑**：画笔路径只读预览

### 5. 表情贴纸
- **创建**：8 大分类（最近、表情、动物、食物、活动、旅行、物品、符号）
- **搜索**：支持关键词搜索
- **编辑**：通用属性（位置/大小/旋转）

### 6. 图片工具
- **创建**：本地上传、网络 URL 添加
- **编辑**：替换图片、水平翻转、垂直翻转

### 7. 历史记录
- **撤销**：取消最近一次操作
- **重做**：恢复已撤销的操作
- **快捷键**：
  - 撤销：`Ctrl+Z` / `Cmd+Z`
  - 重做：`Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Y`

## 工具类型

```typescript
type ToolType =
  | "text"     // 文字
  | "shape"    // 形状
  | "brush"    // 画笔
  | "emoji"    // 表情
  | "image"    // 图片
  | "align"    // 对齐
  | "select";  // 选择
```

> **注意**：画布设置不再作为独立工具，而是集成到右侧面板中，未选中对象时自动显示。

## 使用方式

```tsx
import ZineEditor from "@/zine-editor";

function App() {
  return <ZineEditor />;
}
```

## 开发说明

### 状态管理

使用 React Context 管理编辑器状态：

```typescript
interface ZineEditorStateType {
  object: FabricObject | null;       // 当前选中对象
  setActiveObject: () => void;
  isReady: boolean;                  // 编辑器是否就绪
  editor: Editor | null;              // 编辑器实例
  currentTool: ToolType;              // 当前工具
  setCurrentTool: () => void;
  zoom: number;                       // 缩放比例
  setZoom: () => void;
  canUndo: boolean;                   // 能否撤销
  canRedo: boolean;                   // 能否重做
  handleUndo: () => void;             // 撤销操作
  handleRedo: () => void;             // 重做操作
}
```

### Setter 组件规范

每个 Setter 组件统一使用 `useZineEditor` hook 获取状态：

```tsx
export default function SomeSetter() {
  const { object, editor } = useZineEditor();
  
  if (!object) return null;
  
  // ... 根据 object 和 editor 实现属性编辑
  
  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">属性名称</div>
      {/* 表单控件 */}
    </div>
  );
}
```
