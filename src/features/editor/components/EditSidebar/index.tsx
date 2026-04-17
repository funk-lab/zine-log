import React, { useEffect, useState, useCallback } from "react";
import "./EditSidebar.css";
import type { FitMode } from "./types";
import {
  type ImageEdit,
  DEFAULT_IMAGE_EDIT,
  type RotateDeg,
  type GalleryImage,
} from "@/features/editor/types";
import { getImageEditStyles } from "@/features/editor/lib/image-styles";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface EditSidebarProps {
  /** 当前编辑的图片，null 表示侧栏关闭 */
  image: GalleryImage | null;
  /** 当前图片的编辑状态（从全局状态传入） */
  edit: ImageEdit;
  /** 侧栏开关回调 */
  onClose: () => void;
  /** 应用编辑 - 将本地编辑状态提交到全局 */
  onApply: (edit: ImageEdit) => void;
  /** 重置当前图片编辑 */
  onReset: () => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// 常量
// ──────────────────────────────────────────────────────────────────────────────

const FIT_OPTIONS: { mode: FitMode; icon: string; label: string }[] = [
  { mode: "cover", icon: "⬛", label: "裁剪填满" },
  { mode: "contain", icon: "🔲", label: "完整显示" },
  { mode: "fill", icon: "↔", label: "拉伸填满" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export const EditSidebar: React.FC<EditSidebarProps> = ({
  image,
  edit,
  onClose,
  onApply,
}) => {
  const isOpen = image !== null;

  // 本地中间状态 - 只在组件内部管理，点击应用后才提交到全局
  // 使用 key={image?.id} 来在图片切换时重新初始化状态
  return (
    <EditSidebarContent
      key={image?.id ?? "closed"}
      image={image}
      edit={edit}
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
    />
  );
};

interface EditSidebarContentProps {
  image: GalleryImage | null;
  edit: ImageEdit;
  isOpen: boolean;
  onClose: () => void;
  onApply: (edit: ImageEdit) => void;
}

const EditSidebarContent: React.FC<EditSidebarContentProps> = ({
  image,
  edit,
  isOpen,
  onClose,
  onApply,
}) => {
  // 本地中间状态 - 使用传入的 edit 初始化
  const [localEdit, setLocalEdit] = useState<ImageEdit>(edit);

  // 按 Escape 关闭
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 本地编辑操作
  const handleRotate90 = useCallback(() => {
    setLocalEdit((prev) => ({
      ...prev,
      rotate: ((prev.rotate + 90) % 360) as RotateDeg,
    }));
  }, []);

  const handleFitModeChange = useCallback((mode: FitMode) => {
    setLocalEdit((prev) => ({ ...prev, fitMode: mode }));
  }, []);

  const handleZoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const zoom = parseFloat(e.target.value);
      setLocalEdit((prev) => ({ ...prev, zoom }));
    },
    []
  );

  const handleFlipXToggle = useCallback(() => {
    setLocalEdit((prev) => ({ ...prev, flipX: !prev.flipX }));
  }, []);

  const handleOffsetXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const offsetX = parseInt(e.target.value, 10);
      setLocalEdit((prev) => ({ ...prev, offsetX }));
    },
    []
  );

  const handleOffsetYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const offsetY = parseInt(e.target.value, 10);
      setLocalEdit((prev) => ({ ...prev, offsetY }));
    },
    []
  );

  // 本地重置（不提交到全局）
  const handleLocalReset = useCallback(() => {
    setLocalEdit(DEFAULT_IMAGE_EDIT);
  }, []);

  // 是否有未应用的更改
  const hasChanges = JSON.stringify(localEdit) !== JSON.stringify(edit);

  // 应用编辑
  const handleApply = useCallback(() => {
    if (hasChanges) {
      onApply(localEdit);
    }
    onClose();
  }, [hasChanges, onApply, onClose, localEdit]);

  return (
    <>
      {/* 遮罩 */}
      <div
        className={`sidebar-overlay${isOpen ? " show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 侧栏主体 */}
      <aside
        className={`edit-sidebar${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="图片编辑"
      >
        {/* 头部 */}
        <div className="sidebar-header">
          <h3>图片编辑</h3>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="关闭编辑侧栏"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="sidebar-content">
          {/* 预览缩略图 */}
          <div
            className="preview-thumb"
            style={{
              width: "120px",
              height: "120px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              borderRadius: "var(--r-md)",
              background: "var(--clr-surface-2)",
            }}
          >
            {image && (
              <img
                src={image.blobUrl || image.src}
                alt="图片预览"
                style={{
                  width: "100%",
                  height: "100%",
                  ...getImageEditStyles(localEdit),
                }}
              />
            )}
          </div>

          {/* 文件名 */}
          <div className="sidebar-img-name">{image?.name ?? ""}</div>

          {/* 旋转 + 翻转 - 同一行 */}
          <div className="tool-section">
            <div className="section-label">旋转 / 翻转</div>
            <div className="flex gap-2">
              <button
                className="flex-1 btn btn-ghost"
                onClick={handleRotate90}
                title="顺时针旋转90°"
              >
                旋转 ({localEdit.rotate}°)
              </button>
              <button
                className={`flex-1 btn ${
                  localEdit.flipX ? "btn-primary" : "btn-ghost"
                }`}
                onClick={handleFlipXToggle}
              >
                翻转
              </button>
            </div>
          </div>

          {/* 适配模式 */}
          <div className="tool-section">
            <div className="section-label">适配模式</div>
            <div className="fit-btns">
              {FIT_OPTIONS.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  className={`btn-fit${
                    localEdit.fitMode === mode ? " active" : ""
                  }`}
                  onClick={() => handleFitModeChange(mode)}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 缩放 */}
          <div className="tool-section">
            <div className="section-label">
              缩放 ({localEdit.zoom.toFixed(1)}x)
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={localEdit.zoom}
              onChange={handleZoomChange}
              className="w-full"
            />
          </div>

          {/* 位置偏移 */}
          <div className="tool-section">
            <div className="section-label">位置偏移</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="slider-label">X:</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={localEdit.offsetX}
                  onChange={handleOffsetXChange}
                  className="flex-1"
                />
                <span className="slider-val">{localEdit.offsetX}px</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="slider-label">Y:</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={localEdit.offsetY}
                  onChange={handleOffsetYChange}
                  className="flex-1"
                />
                <span className="slider-val">{localEdit.offsetY}px</span>
              </label>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="sidebar-actions">
          <div className="flex gap-2">
            <button className="flex-1 btn btn-primary" onClick={handleApply}>
              应用
            </button>
            <button className="flex-1 btn btn-ghost" onClick={handleLocalReset}>
              重置
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default EditSidebar;
