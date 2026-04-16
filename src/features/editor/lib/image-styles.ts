import type { ImageEdit } from "@/features/editor/types";

/**
 * 根据编辑状态生成图片 CSS 样式
 * 统一处理预览和实际显示的样式
 *
 * @param edit 图片编辑状态
 * @returns CSS 样式对象
 */
export function getImageEditStyles(edit: Partial<ImageEdit>): React.CSSProperties {
  const {
    rotate = 0,
    zoom = 1,
    flipX = false,
    flipY = false,
    offsetX = 0,
    offsetY = 0,
  } = edit;

  // 构建 transform
  const transforms: string[] = [];
  if (rotate) transforms.push(`rotate(${rotate}deg)`);
  if (zoom !== 1) transforms.push(`scale(${zoom})`);
  if (flipX) transforms.push("scaleX(-1)");
  if (flipY) transforms.push("scaleY(-1)");
  if (offsetX || offsetY) transforms.push(`translate(${offsetX}px, ${offsetY}px)`);

  return {
    transform: transforms.join(" ") || undefined,
  };
}

/**
 * 预览容器样式 - 用于 EditSidebar 预览图
 * 使用与 PhotoRing 一致的显示方式
 */
export const PREVIEW_CONTAINER_STYLE: React.CSSProperties = {
  width: "120px",
  height: "120px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--clr-bg)",
  borderRadius: "var(--r-md)",
  border: "1px solid var(--clr-border)",
};

/**
 * 预览图片样式 - 与 PhotoRing 保持一致
 */
export const PREVIEW_IMAGE_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};
