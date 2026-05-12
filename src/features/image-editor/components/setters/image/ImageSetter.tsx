import { useZineEditor } from "../../../index";
import { Button } from "antd";
import { FImage } from "@/editor/custom-objects";
import { useRef } from "react";
import ClipSetter from "./ClipSetter";

// 图片替换组件
function ReplaceSetter({ object, editor }: { object: any; editor: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      const imageObj = object as FImage;
      if (imageObj.setSrc) {
        imageObj.setSrc(url, () => {
          editor.canvas.requestRenderAll();
          editor.fireCustomModifiedEvent?.();
        });
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Button 
        type="primary" 
        block 
        onClick={() => inputRef.current?.click()}
      >
        替换图片
      </Button>
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

// 翻转操作组件
function FlipSetter({ object, editor }: { object: any; editor: any }) {
  const handleFlipX = () => {
    if (!object || !editor) return;
    object.set("flipX", !object.flipX);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  const handleFlipY = () => {
    if (!object || !editor) return;
    object.set("flipY", !object.flipY);
    editor.canvas.requestRenderAll();
    editor.fireCustomModifiedEvent?.();
  };

  return (
    <div className="zine-btn-group">
      <Button onClick={handleFlipX} size="small">
        水平翻转
      </Button>
      <Button onClick={handleFlipY} size="small">
        垂直翻转
      </Button>
    </div>
  );
}

export default function ImageSetter() {
  const { object, editor } = useZineEditor();

  if (!object) return null;

  const objectType = object.get?.("type");
  if (!['image', 'f-image'].includes(objectType)) return null;

  return (
    <div className="zine-setter-section">
      <div className="zine-section-label">图片操作</div>
      
      <ReplaceSetter object={object} editor={editor} />

      <div className="zine-form-row" style={{ marginTop: 12 }}>
        <ClipSetter object={object} editor={editor} />
      </div>

      <div className="zine-form-row" style={{ marginTop: 12 }}>
        <FlipSetter object={object} editor={editor} />
      </div>
    </div>
  );
}
