import { useZineEditor } from "../../index";
import { isEmojiOnly } from "./utils";
import { SKETCH_ID } from "@/features/utils/constants";
import CanvasSetter from "./canvas/CanvasSetter";

// 通用 Setter
import PositionSetter from "./common/PositionSetter";
import SizeSetter from "./common/SizeSetter";
import RotationSetter from "./common/RotationSetter";
import OpacitySetter from "./common/OpacitySetter";
import AlignSetter from "./common/AlignSetter";
import LayerSetter from "./common/LayerSetter";

// 文字专用 Setter
import FontSetter from "./text/FontSetter";
import TextStyleSetter from "./text/TextStyleSetter";
import TextLayoutSetter from "./text/TextLayoutSetter";
import TextEffectSetter from "./text/TextEffectSetter";

// 形状专用 Setter
import FillSetter from "./shape/FillSetter";
import BorderSetter from "./shape/BorderSetter";
import CornerSetter from "./shape/CornerSetter";

// 图片专用 Setter
import ImageSetter from "./image/ImageSetter";

// Setter 类型定义
type SetterComponent = React.ComponentType;

interface SetterGroup {
  title: string;
  icon: React.ReactNode;
  setters: SetterComponent[];
}

// 通用 Setter 列表（所有对象类型共用）
const commonSetters: SetterComponent[] = [
  // PositionSetter,
  SizeSetter,
  // RotationSetter,
  OpacitySetter,
  AlignSetter,
  LayerSetter,
];

// 根据对象类型获取对应的 Setter 配置
const getSetterConfig = (objectType: string, object: any): SetterGroup => {
  // 标题和图标映射
  const titleMap: Record<string, { title: string; icon: React.ReactNode }> = {
    textbox: { title: "文字属性", icon: <span>T</span> },
    "f-text": { title: "文字属性", icon: <span>T</span> },
    rect: { title: "矩形属性", icon: <span>▭</span> },
    circle: { title: "圆形属性", icon: <span>○</span> },
    triangle: { title: "三角形属性", icon: <span>△</span> },
    polygon: { title: "多边形属性", icon: <span>⬡</span> },
    path: { title: "路径属性", icon: <span>〰</span> },
    image: { title: "图片属性", icon: <span>🖼</span> },
    "f-image": { title: "图片属性", icon: <span>🖼</span> },
    group: { title: "组合属性", icon: <span>📦</span> },
    activeSelection: { title: "多选属性", icon: <span>📦</span> },
  };

  // 根据类型返回对应的 Setter 列表
  switch (objectType) {
    case "textbox":
    case "f-text": {
      // 判断是否为纯 emoji 文本
      const text = object?.text || "";
      const isEmoji = isEmojiOnly(text);

      return {
        title: isEmoji ? "表情包" : titleMap[objectType].title,
        icon: isEmoji ? <span>😀</span> : titleMap[objectType].icon,
        setters: isEmoji
          ? [...commonSetters, FontSetter]
          : [
              ...commonSetters,
              FontSetter,
              TextStyleSetter,
              TextLayoutSetter,
              TextEffectSetter,
            ],
      };
    }

    case "rect":
    case "circle":
    case "triangle":
    case "polygon":
      return {
        ...titleMap[objectType],
        setters: [
          ...commonSetters,
          FillSetter,
          BorderSetter,
          CornerSetter, // 仅在 rect 时有效
        ],
      };

    case "path":
      // 画笔路径：只读预览，不可编辑
      return {
        title: "画笔路径",
        icon: <span>✏️</span>,
        setters: commonSetters, // TODO: 添加 BrushPreview 只读组件
      };

    case "image":
    case "f-image":
      return {
        ...titleMap[objectType],
        setters: [...commonSetters, ImageSetter, BorderSetter],
      };

    case "group":
    case "activeSelection":
      return {
        ...titleMap[objectType],
        setters: [
          PositionSetter,
          SizeSetter,
          RotationSetter,
          OpacitySetter,
          LayerSetter,
        ],
      };

    default:
      return {
        title: "属性",
        icon: <span>⚙️</span>,
        setters: commonSetters,
      };
  }
};

// Setter 容器组件
export default function SettersContainer() {
  const { object, isReady } = useZineEditor();

  if (!isReady) {
    return (
      <div className="zine-setters-empty">
        <span>加载中...</span>
      </div>
    );
  }

  // 未选中对象、选中画布底板或裁切框时显示画布设置
  const isSketch = object?.id === SKETCH_ID;
  const isCropRect = object?.id === "crop-rect";
  if (!object || isSketch || isCropRect) {
    return (
      <div className="zine-setters-container">
        <div className="zine-setters-header">
          <span className="zine-setters-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </span>
          <span className="zine-setters-title">画布设置</span>
        </div>
        <CanvasSetter />
      </div>
    );
  }

  const objectType = object.get?.("type") || "";
  const config = getSetterConfig(objectType, object);

  return (
    <div className="zine-setters-container">
      {/* 面板标题 */}
      <div className="zine-setters-header">
        <span className="zine-setters-icon">{config.icon}</span>
        <span className="zine-setters-title">{config.title}</span>
      </div>

      {/* 动态渲染 Setter 列表 */}
      <div className="zine-setters-content">
        {config.setters.map((SetterComponent, index) => (
          <SetterComponent key={`${objectType}-${index}`} />
        ))}
      </div>
    </div>
  );
}

// 导出单个 Setter（供外部使用）
export {
  // 通用
  PositionSetter,
  SizeSetter,
  RotationSetter,
  OpacitySetter,
  AlignSetter,
  LayerSetter,
  // 文字
  FontSetter,
  TextStyleSetter,
  TextLayoutSetter,
  TextEffectSetter,
  // 形状
  FillSetter,
  BorderSetter,
  CornerSetter,
};
