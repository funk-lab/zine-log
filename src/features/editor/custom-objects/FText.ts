import * as fabric from "fabric";

const additionalProps = (
  "fontFamily fontWeight fontSize text underline overline linethrough" +
  " textAlign fontStyle lineHeight textBackgroundColor charSpacing styles" +
  " direction path pathStartOffset pathSide pathAlign minWidth splitByGrapheme"
).split(" ");

/**
 * FText - 自定义文本类，继承自 fabric.Textbox
 * Fabric.js v6: 使用 ES6 class 语法替代 createClass
 */
// @ts-ignore - 静态方法 fromObject 的签名与基类不完全兼容，但运行时行为正确
export class FText extends fabric.Textbox {
  static type = "f-text";

  // fabric v6: 通过重写 createControls 自定义 controls
  // 先获取父类的默认 controls，再修改/添加自定义的
  static createControls() {
    // 调用父类 createControls 获取默认 controls (tl, tr, bl, br, mt, mb, ml, mr, mtr 等)
    const parentResult = (fabric.Textbox as any).createControls?.() || {
      controls: {},
    };
    const controls = parentResult.controls;

    // 隐藏 mt/mb，只保留 ml/mr 调整宽度
    delete controls.mt;
    delete controls.mb;

    // 重新定义 ml/mr 为 changeWidth
    controls.ml = new fabric.Control({
      x: -0.5,
      y: 0,
      offsetX: -1,
      actionHandler: (fabric as any).controlsUtils?.changeWidth,
      actionName: "resizing",
    });
    controls.mr = new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 1,
      actionHandler: (fabric as any).controlsUtils?.changeWidth,
      actionName: "resizing",
    });

    return { controls };
  }

  padding = 0;
  paintFirst: "stroke" | "fill" = "stroke";

  constructor(text: string, options?: fabric.TextboxProps) {
    super(text, options);
  }

  initDimensions(): void {
    if ((this as any).__skipDimension) {
      return;
    }
    if (this.isEditing) this.initDelayedCursor();
    this.clearContextTop();
    this._clearCache();
    // clear dynamicMinWidth as it will be different after we re-wrap line
    this.dynamicMinWidth = 0;
    // wrap lines
    (this as any)._styleMap = this._generateStyleMap(this._splitText());
    // if after wrapping, the width is smaller than dynamicMinWidth, change the width and re-wrap
    if (this.dynamicMinWidth > this.width) {
      this._set("width", this.dynamicMinWidth);
    }
    if (this.textAlign.indexOf("justify") !== -1) {
      // once text is measured we need to make space fatter to make justified text.
      this.enlargeSpaces();
    }
    // clear cache and re-calculate height
    const height = this.calcTextHeight();
    if (!this.path) {
      this.height = height;
    } else {
      this.height = this.path.height > height ? this.path.height : height;
    }
    // this.saveState({ propertySet: '_dimensionAffectingProps' });
  }

  // @ts-ignore - 方法签名与基类不完全兼容，但运行时行为正确
  toObject(propertiesToInclude?: string[]): any {
    const allProperties = additionalProps.concat(propertiesToInclude || []);
    // NOTE: fabric v5 Textbox 的 toObject 已原生序列化 styles，无需手动处理
    // 之前使用的 fabric.util.stylesToArray 在 v5 中已移除
    const obj = super.toObject(allProperties as any);
    if ((obj as any).path) {
      (obj as any).path = (this.path as any).toObject();
    }
    return obj;
  }

  static async fromObject(object: any): Promise<FText> {
    // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
    const { type, version, text = "", path, ...options } = object;

    // 创建 FText 实例
    const instance = new FText(text, options);

    // 如果有 path，使用 fabric.Path.fromObject 反序列化并设置
    if (path) {
      const pathInstance = await fabric.Path.fromObject(path);
      instance.set("path", pathInstance);
    }

    return instance;
  }
}

// 注册到 fabric classRegistry
fabric.classRegistry.setClass(FText);
