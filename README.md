# zine-log

一个用 React 重写的图文排版设计工具，支持多图上传、模板排版预览，以及本地导出 PNG / SVG / PDF。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Vitest + Testing Library

## 本地启动

```bash
npm install
npm run dev
```

默认访问 `http://localhost:5173`。

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test:run
```

## 当前能力

- 4 个模板：L 型回纹、留白日记、拼贴栏位、照片环
- 左侧图库支持多图上传与勾选参与排版
- 中间画布实时预览当前模板
- 右侧工具栏支持模板切换、文案编辑、主题色和照片环大小调整
- 本地导出 PNG / SVG / PDF

## 代码结构

```text
src/
  app/                     应用入口与全局样式
  components/ui/          shadcn 风格基础组件
  features/editor/        编辑状态、文件处理、三栏 UI 组件
  features/templates/     SVG 模板生成逻辑
  features/export/        PNG / SVG / PDF 导出
  test/                   测试初始化
```
