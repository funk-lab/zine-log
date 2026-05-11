import type { Meta, StoryObj } from '@storybook/react';
import { PhotoGallery } from './PhotoGallery';
import { useState } from 'react';
import './PhotoGallery.css';

const meta: Meta<typeof PhotoGallery> = {
  title: 'Components/PhotoGallery',
  component: PhotoGallery,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 示例数据
const sampleUnselected = [
  { id: 'p1', src: '/img1.jpg', color: 'linear-gradient(135deg,#8a9a6b,#6b7d52)' },
  { id: 'p2', src: '/img2.jpg', color: 'linear-gradient(135deg,#9baec2,#7a96b0)' },
  { id: 'p3', src: '/img3.jpg', color: 'linear-gradient(135deg,#c8b090,#a89068)' },
  { id: 'p4', src: '/img4.jpg', color: 'linear-gradient(135deg,#9ab8d0,#78a0bc)' },
];

const sampleSelected = [
  { id: 'p5', src: '/img5.jpg', color: 'linear-gradient(135deg,#c4a882,#a88a60)' },
  { id: 'p6', src: '/img6.jpg', color: 'linear-gradient(135deg,#8ab0a0,#6a9080)' },
  { id: 'p7', src: '/img7.jpg', color: 'linear-gradient(135deg,#b0c4d0,#8aaac0)' },
];

// 基础用法
export const Default: Story = {
  render: () => {
    const [unselected, setUnselected] = useState(sampleUnselected);
    const [selected, setSelected] = useState(sampleSelected);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <PhotoGallery
          unselectedPhotos={unselected}
          selectedPhotos={selected}
          onUnselectedChange={setUnselected}
          onSelectedChange={setSelected}
          onUploadClick={() => alert('点击上传')}
        />
        <div style={{ flex: 1, padding: 20, background: '#F7F6F3' }}>
          <h3>画布区域</h3>
          <p>已选图片数量: {selected.length}</p>
          <p>待选图片数量: {unselected.length}</p>
        </div>
      </div>
    );
  },
};

// 空状态
export const Empty: Story = {
  render: () => {
    const [unselected, setUnselected] = useState<typeof sampleUnselected>([]);
    const [selected, setSelected] = useState<typeof sampleSelected>([]);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <PhotoGallery
          unselectedPhotos={unselected}
          selectedPhotos={selected}
          onUnselectedChange={setUnselected}
          onSelectedChange={setSelected}
        />
        <div style={{ flex: 1, padding: 20, background: '#F7F6F3' }}>
          <h3>空状态演示</h3>
        </div>
      </div>
    );
  },
};

// 大量图片
export const ManyPhotos: Story = {
  render: () => {
    const generatePhotos = (prefix: string, count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `${prefix}-${i}`,
        src: `/img${i}.jpg`,
        color: `linear-gradient(135deg, hsl(${Math.random() * 360}, 50%, 60%), hsl(${Math.random() * 360}, 50%, 40%))`,
      }));

    const [unselected, setUnselected] = useState(() => generatePhotos('u', 20));
    const [selected, setSelected] = useState(() => generatePhotos('s', 15));

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <PhotoGallery
          unselectedPhotos={unselected}
          selectedPhotos={selected}
          onUnselectedChange={setUnselected}
          onSelectedChange={setSelected}
        />
        <div style={{ flex: 1, padding: 20, background: '#F7F6F3' }}>
          <h3>大量图片演示</h3>
          <p>待选: {unselected.length} 张</p>
          <p>已选: {selected.length} 张</p>
        </div>
      </div>
    );
  },
};
