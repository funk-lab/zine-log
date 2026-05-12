import { useState, useRef, useEffect } from "react";
import { useZineEditor } from "../../../index";
import * as fabric from "fabric";
import { message } from "antd";
import SizeInput from "../common/SizeInput";

const ratios = [
  { label: "3:4", sub: "竖版", w: 390, h: 520 },
  { label: "1:1", sub: "方形", w: 520, h: 520 },
  { label: "4:3", sub: "横版", w: 520, h: 390 },
  { label: "9:16", sub: "手机", w: 360, h: 640 },
  { label: "16:9", sub: "宽屏", w: 640, h: 360 },
];

export default function CanvasSetter() {
  const { editor } = useZineEditor();

  const getSketchSize = () => {
    if (editor?.sketch) {
      return {
        width: editor.sketch.width || 520,
        height: editor.sketch.height || 693,
      };
    }
    return { width: 520, height: 693 };
  };

  const [width, setWidth] = useState(getSketchSize().width);
  const [height, setHeight] = useState(getSketchSize().height);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgImageUrl, setBgImageUrl] = useState<string>("");
  const [cropRatio, setCropRatio] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const presetColors = [
    "#ffffff",
    "#000000",
    "#F7F6F3",
    "#1A1714",
    "#2D6BE4",
    "#E84C3D",
  ];

  // 同步 bgColor
  useEffect(() => {
    if (editor?.sketch) {
      const fill = editor.sketch.fill;
      // 只处理字符串类型的填充色
      if (typeof fill === "string") {
        setBgColor(fill === "transparent" ? "transparent" : fill || "#ffffff");
      }
    }
  }, [editor]);

  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const cropOverlayRef = useRef<fabric.Rect | null>(null);
  const prevClipPathRef = useRef<fabric.Rect | null>(null);

  useEffect(() => {
    if (editor?.sketch) {
      const { width: w, height: h } = getSketchSize();
      setWidth(w);
      setHeight(h);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor?.canvas) return undefined;
    const handleSizeChange = () => {
      const { width: w, height: h } = getSketchSize();
      setWidth(w);
      setHeight(h);
    };
    // @ts-ignore
    editor.canvas.on("fabritor:sketch:size:changed", handleSizeChange);
    return () => {
      // @ts-ignore
      editor.canvas.off("fabritor:sketch:size:changed", handleSizeChange);
    };
  }, [editor]);

  const applySketchSize = (newWidth: number, newHeight: number) => {
    if (editor) {
      editor.setSketchSize({ width: newWidth, height: newHeight });
    }
  };

  const applyCropRatio = (ratio: (typeof ratios)[0]) => {
    if (!editor || !cropRectRef.current) return;

    setCropRatio(ratio.label);

    const sketch = editor.sketch;
    const sketchWidth = sketch.width || 520;
    const sketchHeight = sketch.height || 693;

    const targetRatio = ratio.w / ratio.h;
    const sketchRatio = sketchWidth / sketchHeight;

    let newWidth: number, newHeight: number;
    if (targetRatio > sketchRatio) {
      newWidth = sketchWidth;
      newHeight = newWidth / targetRatio;
    } else {
      newHeight = sketchHeight;
      newWidth = newHeight * targetRatio;
    }

    const newX = (sketchWidth - newWidth) / 2;
    const newY = (sketchHeight - newHeight) / 2;

    cropRectRef.current.set({
      left: newX,
      top: newY,
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });

    if (cropOverlayRef.current && cropOverlayRef.current.clipPath) {
      cropOverlayRef.current.clipPath.set({
        left: newX,
        top: newY,
        width: newWidth,
        height: newHeight,
      });
    }

    setCropArea({ x: newX, y: newY, w: newWidth, h: newHeight });
    editor.canvas.requestRenderAll();
  };

  const startCrop = () => {
    if (!editor) return;

    if (isCropping) {
      cancelCrop();
    }

    setIsCropping(true);
    const sketch = editor.sketch;

    // 保存当前 clipPath，用于取消裁切时恢复
    prevClipPathRef.current = editor.canvas.clipPath as fabric.Rect | null;

    // 将 clipPath 设为覆盖整个 sketch 区域（而非清除），
    // 这样超出 sketch 范围的对象仍被裁掉，不会在裁剪模式中重新出现
    const sketchWidth = sketch.width || 520;
    const sketchHeight = sketch.height || 693;
    editor.canvas.clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: sketchWidth,
      height: sketchHeight,
    });
    editor.canvas.requestRenderAll();

    // 进入裁剪模式时，允许操作 sketch（移动等）
    sketch.set({
      selectable: true,
      evented: true,
      hasControls: false,
      hasBorders: true,
    });
    sketch.setCoords();
    editor.canvas.setActiveObject(sketch);
    editor.canvas.requestRenderAll();

    setCropArea({ x: 0, y: 0, w: sketchWidth, h: sketchHeight });

    const cropRect = new fabric.Rect({
      id: "crop-rect",
      left: 0,
      top: 0,
      width: sketchWidth,
      height: sketchHeight,
      fill: "transparent",
      stroke: "#1890ff",
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockScalingFlip: true,
      hoverCursor: "move",
    });
    // 隐藏旋转、复制、删除控制点，只保留缩放操作点
    cropRect.controls.mtr.visible = false;
    cropRect.controls.copy.visible = false;
    cropRect.controls.del.visible = false;

    const overlay = new fabric.Rect({
      left: 0,
      top: 0,
      width: sketchWidth,
      height: sketchHeight,
      fill: "rgba(0, 0, 0, 0.6)",
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
    });

    const clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: sketchWidth,
      height: sketchHeight,
      absolutePositioned: true,
    });

    clipPath.inverted = true;
    overlay.clipPath = clipPath;

    // 将 cropRect 限制在 sketch 范围内，且不允许扩大超过初始尺寸
    const clampCropRect = () => {
      const currentRect = cropRectRef.current;
      if (!currentRect) return undefined;

      const currentW = (currentRect.width || 100) * (currentRect.scaleX || 1);
      const currentH = (currentRect.height || 100) * (currentRect.scaleY || 1);

      // 尺寸不超过 sketch
      const clampedW = Math.min(currentW, sketchWidth);
      const clampedH = Math.min(currentH, sketchHeight);
      // 位置不超出 sketch
      const clampedX = Math.max(
        0,
        Math.min(currentRect.left || 0, sketchWidth - clampedW)
      );
      const clampedY = Math.max(
        0,
        Math.min(currentRect.top || 0, sketchHeight - clampedH)
      );

      // 归一化 scale
      currentRect.set({
        left: clampedX,
        top: clampedY,
        width: clampedW,
        height: clampedH,
        scaleX: 1,
        scaleY: 1,
      });
      currentRect.setCoords();

      return { x: clampedX, y: clampedY, w: clampedW, h: clampedH };
    };

    const updateOverlay = (area: {
      x: number;
      y: number;
      w: number;
      h: number;
    }) => {
      const currentOverlay = cropOverlayRef.current;
      if (currentOverlay?.clipPath) {
        currentOverlay.clipPath.set({
          left: area.x,
          top: area.y,
          width: area.w,
          height: area.h,
        });
        currentOverlay.clipPath.setCoords();
      }
      setCropArea(area);
      editor.canvas.renderAll();
    };

    cropRect.on("moving", () => {
      const area = clampCropRect();
      if (area) updateOverlay(area);
    });

    cropRect.on("scaling", () => {
      const area = clampCropRect();
      if (area) updateOverlay(area);
    });

    cropRect.on("modified", () => {
      const area = clampCropRect();
      if (area) updateOverlay(area);
    });

    editor.canvas.add(overlay);
    editor.canvas.add(cropRect);
    editor.canvas.setActiveObject(cropRect);
    editor.canvas.requestRenderAll();
    cropRectRef.current = cropRect;
    cropOverlayRef.current = overlay;
  };

  const cancelCrop = () => {
    setIsCropping(false);
    if (editor) {
      if (cropRectRef.current) {
        editor.canvas.remove(cropRectRef.current);
        cropRectRef.current = null;
      }
      if (cropOverlayRef.current) {
        editor.canvas.remove(cropOverlayRef.current);
        cropOverlayRef.current = null;
      }
      // 退出裁剪模式时，恢复 sketch 为不可操作
      editor.sketch.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });
      editor.canvas.discardActiveObject();
      // 恢复裁切前的 clipPath
      editor.canvas.clipPath = prevClipPathRef.current;
      prevClipPathRef.current = null;
      editor.canvas.requestRenderAll();
    }
  };

  const applyCrop = () => {
    if (!editor) return;

    let cropX = cropArea.x;
    let cropY = cropArea.y;
    let cropW = cropArea.w;
    let cropH = cropArea.h;

    if (cropRectRef.current) {
      cropX = cropRectRef.current.left || 0;
      cropY = cropRectRef.current.top || 0;
      cropW =
        (cropRectRef.current.width || 100) * (cropRectRef.current.scaleX || 1);
      cropH =
        (cropRectRef.current.height || 100) * (cropRectRef.current.scaleY || 1);
    }

    if (cropRectRef.current) {
      editor.canvas.remove(cropRectRef.current);
      cropRectRef.current = null;
    }
    if (cropOverlayRef.current) {
      editor.canvas.remove(cropOverlayRef.current);
      cropOverlayRef.current = null;
    }

    // 取 cropRect 和 sketch 的交集
    const sketchWidth = editor.sketch.width || 520;
    const sketchHeight = editor.sketch.height || 693;
    const intersectX = Math.max(0, Math.round(cropX));
    const intersectY = Math.max(0, Math.round(cropY));
    const intersectR = Math.min(sketchWidth, Math.round(cropX + cropW));
    const intersectB = Math.min(sketchHeight, Math.round(cropY + cropH));
    const x = intersectX;
    const y = intersectY;
    const w = intersectR - intersectX;
    const h = intersectB - intersectY;

    if (w <= 0 || h <= 0) {
      message.warning("裁切区域与画布无交集");
      cancelCrop();
      return;
    }

    // 确认裁切：移动所有对象 (-x, -y)，使裁切区域对齐到 (0,0)
    // 排除 sketch，sketch 始终保持在 (0,0)
    if (x !== 0 || y !== 0) {
      const objects = editor.canvas.getObjects();
      const sketchId = editor.sketch.get("id");
      objects.forEach((obj) => {
        if (obj.get("id") === sketchId) return;
        obj.set({
          left: (obj.left || 0) - x,
          top: (obj.top || 0) - y,
        });
        obj.setCoords();
      });
    }

    // 改变 sketch 尺寸为裁切区域大小
    editor.setSketchSize({ width: w, height: h });
    setWidth(w);
    setHeight(h);

    // clipPath 覆盖整个新 sketch（从 0,0 开始）
    const clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
    });
    editor.canvas.clipPath = clipPath;
    prevClipPathRef.current = null;
    editor.canvas.requestRenderAll();

    // 确认裁剪后，恢复 sketch 为不可操作
    editor.sketch.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
    });
    editor.canvas.discardActiveObject();

    setCropArea({ x: 0, y: 0, w, h });
    setIsCropping(false);
  };

  const updateCropSize = (newW: number, newH: number) => {
    newW = Math.max(50, newW);
    newH = Math.max(50, newH);

    setCropArea((prev) => {
      const updated = { ...prev, w: newW, h: newH };
      if (cropRectRef.current && editor) {
        cropRectRef.current.set({
          width: newW,
          height: newH,
          scaleX: 1,
          scaleY: 1,
        });
        if (cropOverlayRef.current && cropOverlayRef.current.clipPath) {
          cropOverlayRef.current.clipPath.set({
            width: newW,
            height: newH,
          });
          cropOverlayRef.current.clipPath.setCoords();
        }
        editor.canvas.renderAll();
      }
      return updated;
    });
  };

  return (
    <div className="zine-setters-content">
      {/* 画布尺寸 */}
      <div className="zine-setter-section">
        <div className="zine-section-label">画布尺寸</div>
        <SizeInput
          width={width}
          height={height}
          onApply={(newW, newH) => {
            setWidth(newW);
            setHeight(newH);
            applySketchSize(newW, newH);
          }}
          min={100}
          max={4000}
          widthLabel="宽 W"
          heightLabel="高 H"
          rowStyle={{ alignItems: "flex-end" }}
        />
      </div>

      {/* 背景色设置 */}
      <div className="zine-setter-section">
        <div className="zine-section-label">背景色</div>
        <div className="zine-color-row">
          {/* 预设颜色 */}
          {presetColors.map((color) => (
            <div
              key={color}
              className={`zine-color-dot ${bgColor === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => {
                setBgColor(color);
                editor?.sketch.set("fill", color);
                editor?.setSketchBgColor("#ffffff");
                editor?.canvas.requestRenderAll();
              }}
            />
          ))}
          {/* 透明选项 */}
          <div
            className={`zine-color-dot ${
              bgColor === "transparent" ? "active" : ""
            }`}
            style={{
              background:
                "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 4px 4px",
            }}
            onClick={() => {
              setBgColor("transparent");
              editor?.setSketchTransparent(true);
              editor?.setSketchBgColor("#ddd");
            }}
          />
          {/* 自定义颜色 */}
          <label className="zine-color-picker-btn">
            <input
              type="color"
              style={{ opacity: 0, position: "absolute", width: 0, height: 0 }}
              value={bgColor === "transparent" ? "#ffffff" : bgColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setBgColor(newColor);
                editor?.sketch.set("fill", newColor);
                editor?.setSketchBgColor("#ffffff");
                editor?.canvas.requestRenderAll();
              }}
            />
          </label>
        </div>
      </div>

      {/* 背景图上传 */}
      <div className="zine-setter-section">
        <div className="zine-section-label">背景图</div>
        {bgImageUrl ? (
          <div className="zine-bg-image-preview">
            <img src={bgImageUrl} alt="背景图预览" />
            <div className="zine-bg-image-actions">
              <button
                className="zine-btn-full zine-btn-secondary-full"
                onClick={() => imageInputRef.current?.click()}
              >
                更换
              </button>
              <button
                className="zine-btn-full zine-btn-text-full"
                onClick={() => {
                  setBgImageUrl("");
                  editor?.clearSketchBackgroundImage();
                }}
              >
                移除
              </button>
            </div>
          </div>
        ) : (
          <button
            className="zine-btn-full zine-btn-secondary-full"
            onClick={() => imageInputRef.current?.click()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: 6, verticalAlign: "middle" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            上传图片
          </button>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            if (file.type === "image/svg+xml") {
              message.info("暂不支持 SVG 格式");
              return;
            }

            const reader = new FileReader();
            reader.onload = async (evt) => {
              const url = evt.target?.result as string;
              try {
                setBgImageUrl(url);
                await editor.setSketchBackgroundImage(url);
              } catch (error) {
                message.error("设置背景图失败");
                setBgImageUrl("");
              }
            };
            reader.readAsDataURL(file);

            // 重置 input
            if (imageInputRef.current) {
              imageInputRef.current.value = "";
            }
          }}
        />
      </div>

      {/* 裁切画布按钮 - 未裁切时显示 */}
      {!isCropping && (
        <div className="zine-setter-section">
          <button
            className="zine-btn-full zine-btn-secondary-full"
            onClick={() => startCrop()}
          >
            裁切画布
          </button>
        </div>
      )}

      {/* 裁切设置 - 裁切中时显示 */}
      {isCropping && (
        <>
          {/* 预设裁切比例 */}
          <div className="zine-setter-section">
            <div className="zine-section-label">选择比例</div>
            <div className="zine-crop-ratios">
              {ratios.map((r) => (
                <div
                  key={r.label}
                  className={`zine-crop-ratio-pill ${
                    cropRatio === r.label ? "active" : ""
                  }`}
                  onClick={() => applyCropRatio(r)}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          {/* 裁切区域设置 */}
          <div className="zine-setter-section">
            <div className="zine-section-label">裁切尺寸</div>
            <div className="zine-form-row">
              <div className="zine-form-group">
                <label className="zine-form-label">宽</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={Math.round(cropArea.w)}
                  min={50}
                  onChange={(e) =>
                    updateCropSize(Number(e.target.value), cropArea.h)
                  }
                />
              </div>
              <div className="zine-form-group">
                <label className="zine-form-label">高</label>
                <input
                  type="number"
                  className="zine-num-input"
                  value={Math.round(cropArea.h)}
                  min={50}
                  onChange={(e) =>
                    updateCropSize(cropArea.w, Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          <div className="zine-setter-section">
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="zine-btn-full zine-btn-secondary-full"
                onClick={cancelCrop}
                disabled={!isCropping}
              >
                取消
              </button>
              <button
                className="zine-btn-full zine-btn-primary-full"
                onClick={applyCrop}
                disabled={!isCropping}
              >
                应用
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
