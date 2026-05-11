# 开发任务记录

## 待办事项

### 1. GalleryImage margin 属性未生效

**状态**: 待排查
**优先级**: 中
**创建时间**: 2026-04-19

#### 问题描述

在 `ImageEdit` 和 `GalleryImage` 接口中添加了 `margin` 属性（默认 0），在 `getImageEditStyles` 函数中也添加了 margin 样式，但实际使用时 margin 没有生效。

#### 相关文件

- `src/features/collage-editor/types.ts` - 定义了 margin 属性
- `src/features/collage-editor/lib/image-styles.ts` - getImageEditStyles 函数
- `src/features/templates/components/PhotoRing.tsx` - 使用 getImageEditStyles 渲染图片

#### 可能原因

1. PhotoRing 组件中图片容器使用了 `overflow: hidden`，margin 可能被裁剪
2. getImageEditStyles 返回的 margin 样式可能没有正确应用到 img 元素
3. 需要检查实际的 CSS 渲染结果

#### 排查步骤

1. 检查浏览器开发者工具中 img 元素的 computed styles
2. 确认 margin 是否被正确应用
3. 检查 PhotoRing 的 slot 容器样式是否有冲突

---

### 2. EditSidebar 拖拽调整 Offset 功能

**状态**: 待实现  
**优先级**: 中  
**预估工时**: 2-3 小时

#### 需求描述

在 EditSidebar 的预览区域添加拖拽交互，让用户可以直接拖动图片来调整 offsetX 和 offsetY，比滑块更直观。

#### 实现方案

```typescript
// EditSidebar/index.tsx 新增逻辑

// 1. 添加拖拽状态
const [isDragging, setIsDragging] = useState(false);
const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

// 2. 鼠标事件处理
const handleMouseDown = useCallback(
  (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: localEdit.offsetX,
      offsetY: localEdit.offsetY,
    };
  },
  [localEdit.offsetX, localEdit.offsetY]
);

const handleMouseMove = useCallback(
  (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // 预览图尺寸 120px 对应 offset 范围 -50~50
    const scaleFactor = 100 / 120;

    setLocalEdit((prev) => ({
      ...prev,
      offsetX: clamp(
        dragStartRef.current.offsetX + deltaX * scaleFactor,
        -50,
        50
      ),
      offsetY: clamp(
        dragStartRef.current.offsetY + deltaY * scaleFactor,
        -50,
        50
      ),
    }));
  },
  [isDragging]
);

const handleMouseUp = useCallback(() => {
  setIsDragging(false);
}, []);

// 3. 全局事件监听（拖拽时鼠标可能移出预览区域）
useEffect(() => {
  if (!isDragging) return;

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
}, [isDragging, handleMouseMove, handleMouseUp]);

// 4. 预览图样式添加 cursor
dragStartRef.current = {
  x: e.clientX,
  y: e.clientY,
  offsetX: localEdit.offsetX,
  offsetY: localEdit.offsetY,
};
```

```tsx
// 5. JSX 预览区域添加事件
<div
  className="preview-thumb"
  onMouseDown={handleMouseDown}
  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
>
  <img ... />
</div>

// 6. 添加提示文字
<div className="preview-hint">拖动图片调整位置</div>
```

#### 需要修改的文件

- `src/features/collage-editor/components/EditSidebar/index.tsx`

#### 注意事项

- 拖拽时实时更新预览，但只在松开时自动应用（或保持当前 Apply 按钮逻辑）
- 考虑添加触控支持（touchstart/touchmove/touchend）
- 鼠标样式变化：grab → grabbing

---

## 已完成
