# PhotoGallery 双区拖拽图库组件

相册编辑器的左侧图库组件，支持双区（待选/已选）拖拽交互。

## 特性

- 🎯 **双区拖拽**：待选素材区和已选入画区互相拖拽
- 🖱️ **分隔线调节**：鼠标拖拽调整双区高度比例
- ⚡ **快捷操作**：hover 显示快捷按钮，一键移动
- 🎨 **序号标识**：已选区图片显示顺序序号
- 👻 **自定义拖影**：跟手幽灵效果替代浏览器默认拖影
- 📱 **响应式**：CSS Grid 自适应布局

## 安装

将 `PhotoGallery` 文件夹复制到项目的 `src/components` 目录下。

## 使用示例

```tsx
import { PhotoGallery, PhotoItem } from './components/PhotoGallery';

function App() {
  const [unselected, setUnselected] = useState<PhotoItem[]>([
    { id: '1', src: '/img1.jpg', color: 'linear-gradient(135deg,#8a9a6b,#6b7d52)' },
    { id: '2', src: '/img2.jpg', color: 'linear-gradient(135deg,#9baec2,#7a96b0)' },
  ]);
  
  const [selected, setSelected] = useState<PhotoItem[]>([
    { id: '3', src: '/img3.jpg', color: 'linear-gradient(135deg,#c4a882,#a88a60)' },
  ]);

  return (
    <PhotoGallery
      unselectedPhotos={unselected}
      selectedPhotos={selected}
      onUnselectedChange={setUnselected}
      onSelectedChange={setSelected}
      onUploadClick={() => console.log('上传图片')}
    />
  );
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `unselectedPhotos` | `PhotoItem[]` | `[]` | 待选素材列表 |
| `selectedPhotos` | `PhotoItem[]` | `[]` | 已选素材列表 |
| `onUnselectedChange` | `(photos: PhotoItem[]) => void` | - | 待选素材变更回调 |
| `onSelectedChange` | `(photos: PhotoItem[]) => void` | - | 已选素材变更回调 |
| `onUploadClick` | `() => void` | - | 上传按钮点击回调 |
| `className` | `string` | `''` | 自定义类名 |
| `style` | `React.CSSProperties` | - | 自定义样式 |

## PhotoItem 类型

```ts
interface PhotoItem {
  id: string;      // 唯一标识
  src: string;     // 图片地址
  color?: string;  // 占位渐变（如 'linear-gradient(135deg,#8a9a6b,#6b7d52)'）
}
```

## 样式变量

组件使用 CSS 变量，可在项目中覆盖：

```css
:root {
  --pg-bg: #F7F6F3;
  --pg-surface: #FFFFFF;
  --pg-brand: #C8773A;
  --pg-selected: #2D6BE4;
  /* ... 更多变量见 PhotoGallery.css */
}
```

## 交互说明

1. **拖拽移动**：长按图片拖拽到另一区域
2. **快捷按钮**：hover 图片显示「加入 ↓」或「移除 ↑」按钮
3. **全部加入**：点击待选区右上角「全部加入 →」
4. **清空已选**：点击已选区右上角「清空 ×」
5. **调整高度**：拖拽中间分隔线调整双区高度
