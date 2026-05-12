用户想要总结fabric.js v6中自定义controls的正确方式。我需要基于之前的修复经验，给出一个清晰的总结。首先，我需要回顾一下v6中controls的实现机制。查看fabric源码和我们的修改，已经了解了：在v6中，controls是通过静态方法`createControls()`创建的，而不是从prototype继承的。每个实例在构造函数中会调用`(this.constructor as typeof InteractiveFabricObject).createControls()`。因此，自定义controls的正确方式是重写静态方法`createControls()`。总结几个要点：1. 不要修改`prototype.controls`，这无效。2. 使用`static createControls()`方法返回一个包含`controls`属性的对象。3. 可以继承父类的默认controls：调用`super.createControls()`获取父类结果，然后修改`result.controls`。4. 也可以完全自定义controls：直接返回`{ controls: {...} }`。5. 对于全局自定义controls（如复制/删除按钮），需要重写基类的`InteractiveFabricObject.createControls()`，并合并自定义controls。我应该提供一个简单的代码示例来说明这两种情况。另外，用户可能还想知道如何在类中重写，以及如何处理全局controls。我来准备总结。现在直接给出回答即可。
在 fabric.js v6 中，controls 的创建机制已完全改变：

## 核心机制
每个对象的 `controls` 是在构造函数中通过**静态方法**创建的：
```javascript
// 构造函数内部
Object.assign(
  this,
  (this.constructor as typeof InteractiveFabricObject).createControls(), // ← 关键
  InteractiveFabricObject.ownDefaults,
);
```
因此：
- ❌ **不再从 `prototype.controls` 继承**
- ✅ **通过 `static createControls()` 方法为每个类单独创建**

## 正确自定义方式

### 1. 为自定义类添加/修改 controls
```typescript
export class MyRect extends fabric.Rect {
  static type = 'my-rect';
  
  // ✅ 正确：重写 createControls 方法
  static createControls() {
    // 获取父类默认 controls
    const parentResult = super.createControls();
    const controls = parentResult.controls;
    
    // 修改/添加自定义 controls
    controls.myControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      actionHandler: myCustomHandler,
      actionName: 'custom-action'
    });
    
    return { controls };
  }
}
```

### 2. 完全自定义 controls（不继承父类）
```typescript
export class MyLine extends fabric.Line {
  static type = 'my-line';
  
  // ✅ 正确：返回全新 controls 对象
  static createControls() {
    return {
      controls: {
        l1: new fabric.Control({ ... }),
        l2: new fabric.Control({ ... })
      }
    };
  }
}
```

### 3. 隐藏/删除默认 controls
```typescript
static createControls() {
  const parentResult = super.createControls();
  const controls = parentResult.controls;
  
  // 删除不需要的控制点
  delete controls.mt;
  delete controls.mb;
  
  // 修改已有的控制点
  controls.ml = new fabric.Control({ ... });
  controls.mr = new fabric.Control({ ... });
  
  return { controls };
}
```

### 4. 为所有对象添加全局 controls（如复制/删除按钮）
```typescript
// 重写基类的 createControls 方法
const InteractiveFabricObject = (fabric as any).InteractiveFabricObject;
const originalCreateControls = InteractiveFabricObject.createControls;
const globalControls = getGlobalControls(); // 你的自定义 controls

InteractiveFabricObject.createControls = function() {
  const result = originalCreateControls.call(this); // 获取默认 controls
  Object.assign(result.controls, globalControls);    // 合并自定义
  return result;
};
```

## 注意事项
1. **每个实例独立**：每个对象实例都会调用其类的 `createControls()` 方法
2. **方法签名必须匹配**：`createControls()` 返回 `{ controls: Record<string, fabric.Control> }`
3. **不会互相影响**：自定义类重写的 `createControls()` 不受全局修改影响
4. **父类调用**：使用 `super.createControls()` 获取父类默认 controls

## 常见错误
- ❌ `static controls = { ... }` （不会生效）
- ❌ `FabricObject.prototype.controls = { ... }` （不会生效）
- ❌ `this.controls = { ... }` （会被覆盖）

唯一正确的路径就是：**为每个需要自定义controls的类重写 `static createControls()` 方法**。