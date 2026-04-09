// StatusBar 组件 - 底部状态栏
import React from 'react';

interface StatusBarProps {
  totalImages?: number;
  selectedCount?: number;
  canvasRatio?: string;
  templateName?: string;
  autoSaved?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalImages = 0,
  selectedCount = 0,
  canvasRatio = '3:4',
  templateName = '螺旋排列',
  autoSaved = true,
}) => {
  return (
    <footer className="statusbar">
      <div className="status-item">
        <div className="status-dot" />
        {autoSaved ? '已自动保存' : '未保存'}
      </div>
      <div className="status-sep" />
      <div className="status-item">{totalImages} 张图片 · 已选 {selectedCount} 张</div>
      <div className="status-sep" />
      <div className="status-item">画布 {canvasRatio} · {templateName}</div>
      <div className="status-sep" />
      <div className="status-item">A4 输出就绪</div>
    </footer>
  );
};

export default StatusBar;