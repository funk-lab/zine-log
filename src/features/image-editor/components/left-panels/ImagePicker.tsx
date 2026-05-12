import { useZineEditor } from "../../index";
import { createFImage } from "@/features/editor/objects/image";
import { message } from "antd";
import { useCallback, useRef, useState } from "react";

// 本地上传组件
function LocalImageUpload({
  onImageSelect,
}: {
  onImageSelect: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "image/svg+xml") {
      message.info("暂不支持 SVG 格式");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      onImageSelect(url);
      // 重置 input 以便选择相同文件时能再次触发
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        className="zine-btn-full zine-btn-primary-full"
        onClick={() => inputRef.current?.click()}
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
        本地上传
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}

// 远程 URL 输入组件
function RemoteImageInput({
  onImageSelect,
}: {
  onImageSelect: (url: string) => void;
}) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!url.trim()) {
      message.warning("请输入图片地址");
      return;
    }
    // 验证图片是否可以加载
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onImageSelect(url.trim());
      setUrl("");
    };
    img.onerror = () => {
      message.error("图片加载失败，请检查地址是否正确");
    };
    img.src = url.trim();
  };

  return (
    <div className="zine-form-row">
      <input
        ref={inputRef}
        type="text"
        className="zine-num-input"
        placeholder="粘贴图片地址"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        style={{ flex: 1 }}
      />
      <button
        className="zine-btn-full zine-btn-primary-full"
        onClick={handleSubmit}
        style={{ width: 70, flexShrink: 0 }}
      >
        插入
      </button>
    </div>
  );
}

export default function ImagePicker() {
  const { editor } = useZineEditor();

  const handleAddImage = async (imageUrl: string) => {
    if (!editor?.canvas) {
      message.error("编辑器未初始化");
      return;
    }

    try {
      await createFImage({
        imageSource: imageUrl,
        canvas: editor.canvas,
      });
    } catch (error) {
      console.error("添加图片失败:", error);
      message.error("添加图片失败");
    }
  };

  return (
    <div className="zine-left-panel-content">
      <div className="zine-left-panel-header">
        <span>插入图片</span>
        <span style={{ fontSize: 11, color: "var(--zine-text-muted)" }}>
          点击添加
        </span>
      </div>

      <div className="zine-left-section">
        {/* 本地上传 */}
        <div className="zine-left-section-title">从本地上传</div>
        <LocalImageUpload
          onImageSelect={(imageUrl) => {
            void handleAddImage(imageUrl);
          }}
        />

        {/* 远程 URL */}
        <div className="zine-left-section-title" style={{ marginTop: 16 }}>
          从网络添加
        </div>
        <RemoteImageInput
          onImageSelect={(imageUrl) => {
            void handleAddImage(imageUrl);
          }}
        />

        {/* 提示信息 */}
        <div className="zine-image-tip">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>支持 JPG、PNG、GIF、WebP 格式</span>
        </div>
      </div>
    </div>
  );
}
