import { useZineEditor } from "../index";
import SettersContainer from "./setters";

export default function RightPanel() {
  const { isReady } = useZineEditor();

  return (
    <aside className="zine-panel-right">
      <div className="zine-right-panel-body">
        {isReady ? (
          <SettersContainer />
        ) : (
          <div className="zine-panel-loading">
            <span>加载中...</span>
          </div>
        )}
      </div>
    </aside>
  );
}
