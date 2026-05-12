import * as fabric from "fabric";
import type { IImageBorder } from "@/types/fabritor";

/**
 * FImage - 自定义图片类，继承自 fabric.Group
 * 包装图片+边框矩形，支持高级图片编辑功能
 * Fabric.js v6: 使用 ES6 class 语法替代 createClass
 */
export class FImage extends fabric.Group {
  static type = "f-image";

  img!: fabric.FabricImage;
  borderRect!: fabric.Rect;
  imageBorder!: IImageBorder;

  constructor(
    options: {
      image: fabric.FabricImage;
      imageBorder?: IImageBorder;
      [key: string]: any;
    } = {} as any
  ) {
    const { image, imageBorder = {}, ...rest } = options;

    // 先设置图片属性
    if (image) {
      image.set({
        originX: "center",
        originY: "center",
      });
    }

    // 创建边框矩形（临时，后面会更新）
    const borderRect = new fabric.Rect({
      width: image ? image.getScaledWidth() : 0,
      height: image ? image.getScaledHeight() : 0,
      rx: imageBorder.borderRadius || 0,
      ry: imageBorder.borderRadius || 0,
      originX: "center",
      originY: "center",
      fill: "#00000000",
      paintFirst: "fill",
    });

    if (imageBorder.stroke) borderRect.stroke = imageBorder.stroke;
    if (imageBorder.strokeWidth)
      borderRect.strokeWidth = imageBorder.strokeWidth;

    // fabric v6: 不在构造函数中设置 clipPath，避免 Group 渲染问题
    // 圆角效果通过重写 _render 方法实现

    // 调用父类构造函数
    // fabric v6: Group 需要设置 layout: 'fixed' 避免 clipPath 相关问题
    super(
      [image, borderRect].filter(Boolean) as fabric.Object[],
      {
        borderColor: "#FF2222",
        borderDashArray: null,
        borderScaleFactor: 2,
        padding: 0,
        subTargetCheck: false,
        ...rest,
      } as fabric.GroupProps
    );

    // fabric v6: 设置 layout 为 'fixed' 避免渲染问题
    (this as any).layout = "fixed";

    // 设置自定义属性
    if (image) {
      this.img = image;
    }
    this.borderRect = borderRect;
    this.imageBorder = imageBorder;

    // fabric v6: 延迟设置 clipPath，避免 Group 初始化时的渲染问题
    if (image && typeof window !== "undefined") {
      setTimeout(() => {
        this._updateImageClipPath();
      }, 0);
    }
  }

  // fabric v6: 更新图片的 clipPath
  private _updateImageClipPath(): void {
    if (!this.img || !this.borderRect) return;
    const rx = this.borderRect.rx || 0;
    const ry = this.borderRect.ry || 0;
    if (rx > 0 || ry > 0) {
      this.img.set({
        clipPath: new fabric.Rect({
          originX: "center",
          originY: "center",
          width: this.img.width || 0,
          height: this.img.height || 0,
          rx,
          ry,
        }),
      });
      this.img.set("dirty", true);
    }
  }

  setSrc(src: string, callback?: () => void): void {
    this.img.setSrc(src, { crossOrigin: "anonymous" }).then(() => {
      const width = this.img.getScaledWidth();
      const height = this.img.getScaledHeight();
      this.img.setCoords();
      this.borderRect.set({ width, height, dirty: true });
      this._updateImageClipPath();

      // 更新 Group 自身尺寸，使包围盒与裁剪后图片一致
      this.set({ width, height });
      this.setCoords();

      if (callback) callback();
    });
  }

  getSrc(): string {
    return this.img.getSrc();
  }

  setBorder(b: IImageBorder): void {
    this.borderRect.set({
      stroke: b.stroke || null,
      strokeWidth: b.strokeWidth || 1,
      rx: b.borderRadius || 0,
      ry: b.borderRadius || 0,
      strokeDashArray: b.strokeDashArray || null,
    });
    this.img.setCoords();
    this._updateImageClipPath();
    this.imageBorder = { ...b };
    // this.addWithUpdate();
  }

  getBorder(): IImageBorder {
    return this.imageBorder;
  }

  // http://fabricjs.com/fabric-filters
  applyFilter(filter: fabric.filters.BaseFilter<string> | null): void {
    try {
      this.img.filters = filter ? [filter] : [];
      this.img.applyFilters();
    } catch (e) {
      console.log(e);
    }
  }

  applyFilterValue(prop: string, value: any): void {
    const filter = this.getFilter();
    if (filter) {
      (filter as any)[prop] = value;
      this.img.filters = [filter];
      this.img.applyFilters();
    }
  }

  getFilter(): fabric.filters.BaseFilter<string> | undefined {
    return this.img.filters[0];
  }

  static async fromObject(object: any): Promise<FImage> {
    // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
    const { type, version, objects, ...options } = object;
    const imgJson = { ...objects[0] };
    delete imgJson.type;
    delete imgJson.version;
    const img = await fabric.FabricImage.fromObject(imgJson);
    const instance = new FImage({ image: img, ...options });
    return Promise.resolve(instance);
  }
}

// 注册到 fabric classRegistry
fabric.classRegistry.setClass(FImage);
