# 图片压缩与 Blob URL 迁移记录

## 背景
将图片存储从 base64 data URL 改为 Blob URL，减少内存占用。同时新增相册式 PDF 导出功能。

## 本次修改计划

### 1. 新增文件（从 cankao 移动并适配）

| 源文件 | 目标路径 | 说明 |
|--------|----------|------|
| `cankao/imageCompressor.ts` | `src/features/export/lib/image-compressor.ts` | 图片压缩工具 |
| `cankao/gridLayout.ts` | `src/features/export/lib/grid-layout.ts` | 4×3 网格布局计算 |
| `cankao/types.ts` | `src/features/export/lib/export-types.ts` | 导出相关类型 |
| `cankao/pdfExporter.ts` | `src/features/export/lib/album-pdf.ts` | 相册式 PDF 导出 |

### 2. 修改现有文件

| 文件 | 改动 |
|------|------|
| `src/features/editor/lib/file.ts` | 上传时压缩图片，返回 Blob URL |
| `src/features/editor/types.ts` | GalleryImage 扩展 blobUrl 等字段 |
| `src/features/export/lib/exporters.ts` | 新增 `downloadAlbumPDF` 函数 |

### 3. 压缩参数配置

```typescript
const COMPRESS_OPTIONS = {
  maxDim: 1200,        // 最大边长
  maxPixels: 2000000,  // 最大像素数
  quality: 0.85,       // JPEG 质量（A4纸放12张图，后续可尝试更小）
};
```

---

## src 字段使用位置清单（全部已修复）

> **说明**：这些位置已从 `image.src` 改为 `image.blobUrl || image.src` 兼容模式

### 1. `src/features/templates/renderers/photo-ring.ts:43` ✅ 已修复
```typescript
// 修复前
href: image?.src ?? "",

// 修复后
const imageUrl = image?.blobUrl || image?.src || "";
href: imageUrl,
```
**用途**：SVG 模板渲染 - 图片链接

### 2. `src/features/rendering/lib/rasterize-svg.ts:30` ✅ 无需修改
```typescript
image.src = url;
```
**用途**：Canvas 渲染 - 临时加载图片（非 GalleryImage.src）

### 3. `src/features/templates/lib/spiral.ts:188-195` ✅ 已修复
```typescript
// 修复前
if (image?.src) {
  return `<image href="${image.src}" ... />`;
}

// 修复后
const imageUrl = (image as GalleryImage & { blobUrl?: string })?.blobUrl || image?.src;
if (imageUrl) {
  return `<image href="${imageUrl}" ... />`;
}
```
**用途**：SVG 模板 - 螺旋布局图片

### 4. `src/features/templates/components/PhotoRing.tsx:97,140` ✅ 已修复
```typescript
// 修复前
const hasImage = image?.src;
<img src={image.src} ... />

// 修复后
const imageUrl = image?.blobUrl || image?.src;
const hasImage = !!imageUrl;
<img src={imageUrl} ... />
```
**用途**：React 组件 - 图片预览显示

### 5. `src/features/editor/Editor.tsx:201,206` ✅ 已修复
```typescript
// 修复前
if (!image?.src) return null;
objUrl: image.src,

// 修复后
const objUrl = image?.blobUrl || image?.src;
if (!objUrl) return null;
objUrl,
w: image?.compWidth || 0,
h: image?.compHeight || 0,
```
**用途**：EditSidebar 图片项转换

### 6. `src/features/editor/components/PhotoGallery/PhotoGallery.tsx:79,426` ✅ 已修复
```typescript
// 修复前
setGhostImg(photo.src || "");
<img src={photo.src} ... />

// 修复后
setGhostImg(photo.blobUrl || photo.src || "");
<img src={photo.blobUrl || photo.src} ... />
```
**用途**：拖拽预览和缩略图显示

---

## GalleryImage 类型变更

### 修改前
```typescript
export interface GalleryImage extends BaseImage, ImageEdit {
  color?: string;
  uploadedAt?: number;
  mimeType?: string;
  size?: number;
  alt?: string;
}

export interface BaseImage {
  id: string;
  src: string;        // ⚠️ base64 data URL
  name: string;
}
```

### 修改后
```typescript
export interface GalleryImage extends BaseImage, ImageEdit {
  color?: string;
  uploadedAt?: number;
  mimeType?: string;
  size?: number;          // 原始文件大小
  alt?: string;
  
  // ✅ 新增字段
  blobUrl: string;        // 压缩后的 Blob URL（主要显示用）
  origSize: number;       // 原始文件大小
  compSize: number;       // 压缩后大小
  w: number;              // 压缩后宽度
  h: number;              // 压缩后高度
}

export interface BaseImage {
  id: string;
  src: string;            // ⚠️ 【已弃用】保留兼容，后续移除
  name: string;
}
```

---

## 执行状态

- [x] 1. 创建 file.md（本文件）
- [x] 2. 移动 cankao 文件到项目目录
- [x] 3. 修改 file.ts 添加压缩逻辑
- [x] 4. 扩展 GalleryImage 类型
- [x] 5. 新增 downloadAlbumPDF
- [x] 6. 搜索并记录所有 src 使用位置
- [ ] 7. 人工检查所有 src 使用位置
- [ ] 8. 测试上传、显示、导出功能

---

## 新增/修改的文件清单

### 新增文件
- `src/features/export/lib/export-types.ts` - 导出相关类型定义
- `src/features/export/lib/image-compressor.ts` - 图片压缩工具
- `src/features/export/lib/grid-layout.ts` - 4×3 网格布局计算
- `src/features/export/lib/album-pdf.ts` - 相册式 PDF 导出

### 修改的文件
- `src/features/editor/types.ts` - GalleryImage 扩展 blobUrl 等字段
- `src/features/editor/lib/file.ts` - 上传时自动压缩图片
- `src/features/export/lib/exporters.ts` - 新增 downloadAlbumPDF 函数

---

## 后续优化 TODO

1. **压缩参数调优**：A4纸放12张图，单图尺寸约 185×164 pt，可尝试更低质量（如 0.7-0.8）
2. **内存释放**：组件卸载时调用 `URL.revokeObjectURL()`
3. **移除 src 字段**：确认所有位置迁移完成后，从 BaseImage 中移除 src
4. **离线支持**：考虑将 Blob 存入 IndexedDB 实现持久化

---

## 相册 PDF 导出使用方式

```typescript
import { downloadAlbumPDF } from '@/features/export/lib/exporters';

// 导出已选图片为相册式 PDF
await downloadAlbumPDF(state.selected, {
  filename: 'my-album.pdf',
  jpegQuality: 0.88,
}, (progress) => {
  console.log(`${Math.round(progress.progress * 100)}% - ${progress.message}`);
});
```

每页布局：4列 × 3行 = 12张图，A4横向。

---

## PDF 导出图片编辑效果实现记录 (2026-04-19)

### 问题描述
导出 PDF 时，图片的编辑属性（旋转、缩放、翻转、偏移、fitMode 裁剪）没有生效。

### 原因分析
1. 预览时有 slot/卡片容器提供裁剪，导出时需要类似机制
2. Canvas 尺寸等于 slot 尺寸，但 drawImage 使用 fit.dw/dh 导致尺寸不匹配
3. pdf-lib 没有直接的 clipRect 方法，需要用 pushGraphicsState + clip() 实现

### 最终解决方案：Canvas 2D 变换

采用与 SVG 预览一致的 Canvas 2D 变换逻辑：

```typescript
// 1. Canvas 尺寸等于 slot 尺寸
const canvas = new OffscreenCanvas(slot.width, slot.height);
const ctx2d = canvas.getContext("2d")!;

// 2. 白色背景
ctx2d.fillStyle = "white";
ctx2d.fillRect(0, 0, slot.width, slot.height);

// 3. 变换中心点（图片区域中心）
const centerX = imageX + imageSize / 2;
const centerY = imageY + imageSize / 2;
ctx2d.translate(centerX, centerY);

// 4. 翻转
if (ctx.flipX) ctx2d.scale(-1, 1);
if (ctx.flipY) ctx2d.scale(1, -1);

// 5. 缩放
if (ctx.zoom !== 1) {
  ctx2d.scale(ctx.zoom, ctx.zoom);
}

// 6. 偏移
const offsetXPx = (ctx.offsetX / 100) * imageSize * ctx.zoom;
const offsetYPx = (ctx.offsetY / 100) * imageSize * ctx.zoom;
ctx2d.translate(-centerX + offsetXPx, -centerY + offsetYPx);

// 7. 裁剪（超出 imageX/imageY/imageSize/imageSize 的部分被裁剪）
ctx2d.beginPath();
ctx2d.rect(imageX, imageY, imageSize, imageSize);
ctx2d.clip();

// 8. 绘制图片
ctx2d.drawImage(img, fit.sx, fit.sy, fit.sW, fit.sH, imgDrawX, imgDrawY, fit.dw, fit.dh);
```

### 核心概念

| 概念 | 说明 |
|------|------|
| `fitMode` | cover/contain/fill 三种裁剪模式 |
| `calcFit` | 根据 fitMode 计算源图裁剪区域和目标绘制尺寸 |
| `ctx2d.rect() + clip()` | Canvas 裁剪，替代 SVG 的 clipPath |
| `translate/rotate/scale` | Canvas 2D 变换实现翻转、缩放、偏移 |

### 图片模糊问题

**原因**：slot 尺寸是 pt 单位（~185pt），Canvas 用这么小的像素尺寸绘制 JPEG 质量会较差。

**解决**：提高 JPEG 质量到 0.92+，或按比例放大 Canvas 尺寸。

### 相关文件

- `src/features/export/lib/album-pdf.ts` - PDF 导出核心逻辑
- `src/features/export/lib/grid-layout.ts` - 布局计算，包含 calcFit
- `src/features/templates/lib/svg.ts` - SVG 预览参考，实现 getSvgImageTransform

---

## Bug 修复记录

### 2026-04-20: cover 模式下图片拉伸问题

**问题描述**：PDF 导出时，`fitMode=cover` 的图片出现拉伸变形。

**原因分析**：`calcFit` 函数中 `cover` 模式的 `dw`/`dh` 计算错误：

```typescript
// ❌ 错误代码
if (ir > sr) {
  const sc = sh / ih;
  const dw = iw * sc;  // 错误：应该是 sw
  return { ..., dw, dh: sh };
} else {
  const sc = sw / iw;
  const dh = ih * sc;  // 错误：应该是 sh
  return { ..., dw: sw, dh };
}
```

在 `cover` 模式下，图片应该填满整个目标区域（`sw × sh`），超出部分通过 `sx/sy/sW/sH` 裁剪。`dw`/`dh` 必须是目标区域尺寸，而不是缩放后的图片原始尺寸。

**修复方案**：

```typescript
// ✅ 正确代码
if (ir > sr) {
  const sc = sh / ih;
  return { sx: (iw - sw / sc) / 2, sy: 0, sW: sw / sc, sH: ih, dw: sw, dh: sh };
} else {
  const sc = sw / iw;
  return { sx: 0, sy: (ih - sh / sc) / 2, sW: iw, sH: sh / sc, dw: sw, dh: sh };
}
```

**修复文件**：`src/features/export/lib/album-pdf.ts` (lines 67-78)
