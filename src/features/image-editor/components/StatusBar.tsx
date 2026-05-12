import { useZineEditor } from "../index";
import { SKETCH_ID } from "@/features/utils/constants";

interface StatusBarProps {
  toolText: string;
  zoom: number;
}

export default function StatusBar({ toolText, zoom }: StatusBarProps) {
  const { object } = useZineEditor();

  const getCanvasInfo = () => {
    // TODO: 从 fabric canvas 获取实际画布尺寸
    return "画布 3:4 · 520×693";
  };

  const getSelectionInfo = () => {
    if (!object || object.id === SKETCH_ID) {
      return "未选择对象";
    }
    return "已选 1 个对象";
  };

  return (
    <footer className="zine-statusbar">
      <div className="zine-status-item">
        <div className="zine-status-dot"></div>
        已自动保存
      </div>
      <div className="zine-status-sep"></div>
      <div className="zine-status-item">当前工具：{toolText}</div>
      <div className="zine-status-sep"></div>
      <div className="zine-status-item">{getCanvasInfo()}</div>
      <div className="zine-status-sep"></div>
      <div className="zine-status-item">{getSelectionInfo()}</div>
      <div className="zine-status-sep"></div>
      <div className="zine-status-item">{zoom}%</div>
    </footer>
  );
}
