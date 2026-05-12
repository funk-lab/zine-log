# Fabric.js v6 文本撤销/重做兼容性修复

## 问题描述

在 Zine Editor 中，对文本对象（`FText`）进行操作（如添加、调整大小、移动等）后，执行撤销操作时会抛出错误：

```
TypeError: Cannot set property type of [object Object] which has only a getter
    at FText._set (Object.ts:621:10)
    at FText._set (IText.ts:258:18)
    ...
```

## 问题根因

### 1. Fabric.js v6 的变化

Fabric.js v6 对对象属性做了重大调整：

- **`type` 属性变为只读**：在 v6 中，`type` 属性使用 `getter` 定义，无法通过 `set()` 或 `setOptions()` 修改
- **`fromObject` 静态方法的执行时机**：当通过 `canvas.loadFromJSON()` 恢复对象时，Fabric 会使用 `classRegistry` 中注册的类（通过 `type` 属性匹配），然后调用该类的 `fromObject` 方法创建实例

### 2. 自定义对象的 `fromObject` 问题

项目中的自定义对象（FText、FLine、FImage、FArrow、FTriArrow）在实现 `fromObject` 时，将从 JSON 反序列化得到的整个 `object` 参数传给了构造函数：

```typescript
// 修复前 - 问题代码
static fromObject(object: any): Promise<FText> {
  const { text = '', path, ...options } = object;
  const instance = new FText(text, options);  // options 包含 type 属性
  // ...
}
```

构造函数内部会调用 `setOptions(options)`，而 `options` 中包含 `type` 和 `version` 属性，导致错误。

## 解决方案

在所有自定义对象的 `fromObject` 方法中，从参数中移除 `type` 和 `version` 属性：

### FText.ts

```typescript
static async fromObject(object: any): Promise<FText> {
  // 移除 type 和 version，避免 Fabric v6 中设置只读属性的错误
  const { type, version, text = '', path, ...options } = object;
  const instance = new FText(text, options);
  // ...
}
```

### FLine.ts

```typescript
static fromObject(object: any): Promise<FLine> {
  // 移除 type 和 version
  const { type, version, ...rest } = object;
  const options = { ...rest };
  options.points = [object.x1, object.y1, object.x2, object.y2];
  const instance = new FLine(options as any);
  // ...
}
```

### FImage.ts

```typescript
static async fromObject(object: any): Promise<FImage> {
  // 移除 type 和 version
  const { type, version, objects, ...options } = object;
  const imgJson = { ...objects[0] };
  delete imgJson.type;
  delete imgJson.version;
  // ...
}
```

### FArrow.ts / FTriArrow.ts

```typescript
static fromObject(object: any): Promise<FArrow> {
  // 移除 type 和 version
  const { type, version, ...rest } = object;
  return Promise.resolve(new FArrow([object.x1, object.y1, object.x2, object.y2], rest));
}
```

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/editor/custom-objects/FText.ts` | 移除 `type`、`version` |
| `src/editor/custom-objects/FLine.ts` | 移除 `type`、`version` |
| `src/editor/custom-objects/FImage.ts` | 移除 `type`、`version` |
| `src/editor/custom-objects/FArrow.ts` | 移除 `type`、`version` |

## 相关知识

### Fabric.js v6 类注册机制

1. 自定义类通过 `fabric.classRegistry.setClass(FText)` 注册
2. 注册时，系统会记录 `FText.type = 'f-text'` 作为标识
3. 恢复对象时，根据 JSON 中的 `type` 字段找到对应类
4. 调用该类的 `fromObject` 方法创建实例

### 为什么需要移除 type 和 version

- `type` 在 v6 中是类的标识，用于 `classRegistry` 查找，不是对象属性
- `version` 是 Fabric 的内部版本号，也不需要传给构造函数
- 构造函数只需要业务相关的属性（如 `text`、`width`、`fill` 等）
