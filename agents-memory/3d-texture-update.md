# 3D 贴图更新方案

> 目标：将 SVG 螺旋布局迁移到 DOM 组件 (PhotoRing)，同时保持 3D 预览功能

---

## 背景

**当前架构**：

```
SVG markup → rasterizeSvgToCanvas → Canvas → Three.js Texture → FoldedPanel
```

**问题**：DOM 组件 (PhotoRing) 无法直接转换为 Texture 供 3D 使用

---

## 备选方案

### 方案 1：html2canvas / dom-to-image

使用第三方库将 DOM 元素转换为 Canvas/Image。

#### 实现思路

```typescript
// 新增 lib/rasterize-dom.ts
import html2canvas from "html2canvas";

export async function rasterizeDomToCanvas(
  element: HTMLElement,
  width: number,
  height: number,
  options?: { scale?: number }
) {
  const canvas = await html2canvas(element, {
    width,
    height,
    scale: options?.scale ?? 2,
    backgroundColor: null,
    useCORS: true,
  });
  return canvas;
}
```

改造 `usePreviewTextureSource`：

```typescript
export function usePreviewTextureSource(
  photoRingRef: React.RefObject<HTMLElement>,
  width: number,
  height: number
) {
  useEffect(() => {
    if (!photoRingRef.current) return;

    rasterizeDomToCanvas(photoRingRef.current, width, height, {
      scale: PREVIEW_TEXTURE_SCALE,
    }).then((canvas) => {
      setState({ canvas, error: null });
    });
  }, [photoRingRef, width, height]);
}
```

#### 优点

- 完全复用现有 3D 管线，改动最小
- `FoldedPanel` 无需任何修改
- 支持复杂 CSS 样式、阴影、圆角等
- 单张 Texture，性能稳定

#### 缺点

- 新增依赖 (~100KB)
- 异步截图有短暂延迟
- 某些 CSS 属性（如 backdrop-filter）支持不完善
- 频繁更新时性能开销大

#### 适用场景

- 追求最小改动
- 布局样式复杂
- 更新频率较低

---

### 方案 2：双渲染管线（SVG for 3D, DOM for 编辑）

保留 SVG 用于 3D 预览/导出，DOM 组件仅用于编辑器交互。

#### 实现思路

```
┌─────────────────┐     ┌─────────────────┐
│   PhotoRing     │     │  buildPhotoRing │
│   DOM 组件      │     │  SVG 生成器      │
│   (编辑器)       │     │  (3D预览/导出)   │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
   用户交互编辑            rasterizeSvgToCanvas
   实时预览                 │
                            ▼
                      FoldedPanel
```

代码层面：

```typescript
// 编辑器
<PhotoRing count={count} gap={gap} scale={scale} onSlotClick={handleEdit} />;

// 3D 预览（保留原有逻辑）
const svgMarkup = buildPhotoRingTemplate(state);
<Preview3D svgMarkup={svgMarkup} />;
```

#### 优点

- 无需新增依赖
- 3D 预览使用成熟的 SVG 管线
- DOM 组件专注交互，无需考虑导出
- 两套渲染互不影响，逻辑清晰

#### 缺点

- 需要维护两套渲染逻辑（DOM + SVG）
- 可能出现视觉不一致（CSS vs SVG 渲染差异）
- 同一配置需要同步到两个渲染器

#### 适用场景

- 希望保持现有 3D 管线稳定
- 编辑器交互复杂，DOM 不可替代
- 对两套渲染的一致性要求不高

---

### 方案 5：独立纹理数组

每个图片单独生成 `CanvasTexture`，`FoldedPanel` 接收自己的 texture。

#### 实现思路

改造数据流：

```typescript
// 1. PhotoRing 拆分：布局计算 vs 渲染
export function useSpiralLayout(count, gap, scale, width, height) {
  const positions = generateSpiralPositions(count, gap);
  // ... 计算边界框、缩放、偏移
  return {
    positions: [
      { x, y, size, gridX, gridY, index, transform },
      // ...
    ],
  };
}

// 2. 3D 管线：为每张图片生成独立 texture
async function generateImageTextures(images, positions) {
  return Promise.all(
    images.map(async (img, i) => {
      // 创建临时 canvas，绘制单张图片（含旋转/缩放效果）
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 应用变换：旋转、缩放等
      applyTransform(ctx, positions[i].transform);

      // 绘制图片
      const image = await loadImage(img.src);
      ctx.drawImage(image, 0, 0, positions[i].size, positions[i].size);

      return new THREE.CanvasTexture(canvas);
    })
  );
}

// 3. FoldedStrip 接收 texture 数组
interface FoldedStripProps {
  model: PreviewStripModel;
  textures: THREE.Texture[]; // 改为数组
}

// 4. FoldedPanel 使用对应 texture
<FoldedPanel panel={panel} texture={textures[index]} />;
```

#### 优点

- 逻辑清晰：每张图片独立控制
- 无需合并图片，支持独立动画
- DOM 和 3D 使用同一套布局计算
- 单张图片更新时无需重绘全部

#### 缺点

- 多个 Texture 对象，显存占用增加
- 需要修改 `FoldedStrip`、`FoldedPanel` 接口
- 图片数量多时创建开销大

#### 适用场景

- 每张图片需要独立变换（旋转、缩放）
- 支持单张图片动态更新
- 图片数量适中（< 50）

---

### 方案 6：统一核心算法（已实现）

将 3D 模型构建器改造为使用 `generateSpiralPositions`，实现 DOM/SVG/3D 共用同一螺旋算法。

#### 实现

新增 `build-spiral-model.ts`：

```typescript
// 3D 模型使用与 DOM 相同的核心算法
import { generateSpiralPositions } from "@/features/templates/lib/spiral";

export function buildSpiralModel(
  count: number,
  gap: number = 1,
  scale: number = 1.5,
  canvasWidth: number = 900,
  canvasHeight: number = 1000
): PreviewStripModel {
  // 1. 使用核心算法生成螺旋坐标
  const spiralPositions = generateSpiralPositions(count, gap);

  // 2. 计算边界框（与 DOM 相同逻辑）
  const bounds = calculateSpiralBounds(spiralPositions);

  // 3. 计算单元格大小（与 DOM 相同逻辑）
  const cellSize = calculateCellSize(spanCols, spanRows, ...);

  // 4. 构建面板和铰链
  // ...
}
```

#### 算法调用链

```
┌─────────────────────────────────────────────────────────────┐
│                    generateSpiralPositions                    │
│                    (唯一核心算法，spiral.ts)                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ PhotoRing │  │ SVG      │  │ buildSpiral  │
│ (DOM)    │  │ Template │  │ Model (3D)   │
└──────────┘  └──────────┘  └──────────────┘
```

#### 优点

- **单一真相源**：修改一处，全局生效
- 算法一致性保证
- 易于测试和维护

#### 使用方式

```typescript
// 未来可替换 preview-3d.tsx 中的模型构建
import { buildSpiralModel } from "@/features/preview3d/model/build-spiral-model";

// 替代 buildStripModelFromRegions
const model = buildSpiralModel(
  images.length,
  template === "loose-ring" ? 2 : 1,
  ringScale,
  width,
  height
);
```

---

## 方案对比

| 维度           | 方案 1 (html2canvas) | 方案 2 (双渲染) | 方案 5 (独立纹理) |
| -------------- | -------------------- | --------------- | ----------------- |
| **改动量**     | 中                   | 小              | 大                |
| **新增依赖**   | 是 (~100KB)          | 否              | 否                |
| **性能**       | 截图有开销           | 最优            | 显存占用增加      |
| **一致性**     | 高                   | 中（两套渲染）  | 高                |
| **DOM 交互**   | 有限                 | 完整            | 有限              |
| **单图更新**   | 需重截图             | 需重生成 SVG    | 仅更新单张        |
| **实现复杂度** | 中                   | 低              | 高                |

---

## 决策建议

### 推荐选择

1. **短期/保守选择：方案 2 (双渲染)**

   - 保持现有 3D 管线稳定
   - 快速实现 DOM 编辑器
   - 风险最低

2. **长期/完整方案：方案 5 (独立纹理)**

   - 架构最清晰
   - 支持更复杂的单图变换
   - 为后续功能扩展留空间

3. **探索性选择：方案 1 (html2canvas)**
   - 当 DOM 样式极其复杂时使用
   - 需要权衡依赖大小

### 注意事项

- 无论选择哪个方案，都应复用 `spiral.ts` 中的布局计算
- 保持 `PhotoRingProps` 接口稳定
- 3D 场景的灯光和阴影效果需验证兼容性

---

## 相关文件

- `src/features/templates/components/PhotoRing.tsx` - DOM 组件
- `src/features/templates/lib/spiral.ts` - 布局算法
- `src/features/rendering/lib/rasterize-svg.ts` - SVG 转 Canvas
- `src/features/preview3d/components/folded-strip.tsx` - 3D 条带
- `src/features/preview3d/components/folded-panel.tsx` - 3D 卡片
- `src/features/preview3d/lib/use-preview-texture-source.ts` - Texture 源

---

## 2026-04-20 修复记录

### 修复 1：offsetX/Y 计算不一致

**问题**：`svg.ts` 和 `image-styles.ts` 对 `offsetX/Y` 的处理方式不同

| 文件                 | 原处理方式                                |
| -------------------- | ----------------------------------------- |
| `svg.ts:210-216`     | `(offsetX / 100) * size * zoom`（百分比） |
| `image-styles.ts:28` | `offsetX px`（像素值）                    |

**修复**：根据 `ImageEdit` 类型定义（`offsetX/Y` 为像素值），统一修改 `svg.ts`：

```typescript
// 之前
const tx = (offsetX / 100) * size * zoom;

// 之后
const tx = offsetX / zoom; // 像素值，除以 zoom 抵消缩放影响
```

**相关文件**：

- `src/features/templates/lib/svg.ts`
- `src/features/collage-editor/lib/image-styles.ts`

---

### 修复 2：3D 预览图片偏移溢出

**问题**：当图片有 `offsetX/Y` 偏移时，超出 slot 的部分显示到了其他图片上

**原因**：SVG `clipPath` 默认在 `objectBoundingBox` 坐标系中应用裁剪，当图片应用 `transform` 时，裁剪区域会跟着变换

**修复**：在 `gridSlotMarkup` 中添加 `clipPathUnits="userSpaceOnUse"`，确保裁剪在绝对坐标系中生效：

```typescript
// 之前
<clipPath id="${slotId}">
  <rect x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" />
</clipPath>

// 之后
<clipPath id="${slotId}" clipPathUnits="userSpaceOnUse">
  <rect x="${imageX}" y="${imageY}" width="${imageSize}" height="${imageSize}" />
</clipPath>
```

**相关文件**：

- `src/features/templates/lib/svg.ts`

---

_记录时间: 2026-04-15_
_更新: 2026-04-20_
