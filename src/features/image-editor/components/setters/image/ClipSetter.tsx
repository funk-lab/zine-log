import { Button, Space } from "antd";
import { useRef, useState, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

interface ClipSetterProps {
  object: any;
  editor: any;
}

export default function ClipSetter({ object, editor }: ClipSetterProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [imgInfo, setImgInfo] = useState<any>({});

  const startCrop = () => {
    if (!object || !editor) return;
    const boundingRect = object.getBoundingRect(true);
    const canvasEl = editor.canvas.getElement();
    const canvasRect = canvasEl.getBoundingClientRect();

    setImgInfo({
      src: object.getSrc(),
      width: boundingRect.width,
      height: boundingRect.height,
      left: canvasRect.left + boundingRect.left,
      top: canvasRect.top + boundingRect.top,
    });

    setShowCrop(true);
    object.set("hasControls", false);
    object.set("selectable", false);
    editor.canvas.requestRenderAll();
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const newImage = cropperRef.current.getCroppedCanvas().toDataURL();
      object.setSrc(newImage, () => {
        object.set("hasControls", true);
        object.set("selectable", true);
        editor.canvas.requestRenderAll();
        object.setCoords();
        editor.fireCustomModifiedEvent?.();
      });
      setShowCrop(false);
    }
  };

  const changeRatio = (r: number) => {
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(r);
    }
  };

  const cancel = () => {
    setShowCrop(false);
    object.set("hasControls", true);
    object.set("selectable", true);
    editor.canvas.requestRenderAll();
  };

  useEffect(() => {
    if (!showCrop || !imgRef.current) return undefined;

    const initCropper = () => {
      if (!imgRef.current) return;
      cropperRef.current = new Cropper(imgRef.current, {
        scalable: false,
        autoCropArea: 1,
        viewMode: 1,
        toggleDragModeOnDblclick: false,
        minContainerWidth: 1,
        minContainerHeight: 1,
      });
    };

    if (imgRef.current.complete) {
      initCropper();
    } else {
      imgRef.current.onload = initCropper;
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [showCrop]);

  return (
    <div>
      <Button block onClick={startCrop}>
        裁剪图片
      </Button>

      {showCrop ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,.65)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "absolute",
              zIndex: 1001,
              left: imgInfo.left,
              top: imgInfo.top - 38,
            }}
          >
            <Space.Compact block>
              <Button size="small" onClick={() => changeRatio(1)}>
                1:1
              </Button>
              <Button size="small" onClick={() => changeRatio(4 / 3)}>
                4:3
              </Button>
              <Button size="small" onClick={() => changeRatio(3 / 4)}>
                3:4
              </Button>
              <Button size="small" onClick={() => changeRatio(16 / 9)}>
                16:9
              </Button>
              <Button size="small" onClick={() => changeRatio(9 / 16)}>
                9:16
              </Button>
              <Button size="small" onClick={cancel}>
                取消
              </Button>
              <Button size="small" type="primary" onClick={handleCrop}>
                确认
              </Button>
            </Space.Compact>
          </div>
          <div
            style={{
              width: imgInfo.width,
              height: imgInfo.height,
              position: "absolute",
              zIndex: 1001,
              left: imgInfo.left,
              top: imgInfo.top,
            }}
            onDoubleClick={handleCrop}
          >
            <img
              ref={imgRef}
              src={imgInfo.src}
              style={{ display: "block", maxWidth: "100%" }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
