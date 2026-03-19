# zine-log

一个图文排版设计工具，支持多图上传、模板排版预览，以及本地导出 PNG / SVG / PDF。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Vitest + Testing Library
- Docker + Nginx

## 本地开发

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

- 4 个模板：L 型回纹、留白日记、拼贴栏位、螺纹
- 左侧图库支持多图上传与勾选参与排版
- 中间画布支持实时预览与缩放
- 右侧工具栏支持模板切换、文案编辑、主题色设置
- 本地导出 PNG / SVG / PDF

## 代码结构

```text
src/
  app/                    应用入口与全局样式
  components/ui/          shadcn 风格基础组件
  features/editor/        编辑状态、文件处理、三栏 UI 组件
  features/templates/     SVG 模板生成逻辑
  features/export/        PNG / SVG / PDF 导出
  test/                   测试初始化
deploy/
  nginx.default.conf      容器内 Nginx 配置
  zinelog.rmmark.conf     服务器侧 Nginx 示例配置
```

## Docker 部署

项目已内置 Docker 部署文件，适合在服务器上直接 `git pull` 后重建。

首次部署：

```bash
git clone <repo-url> /opt/zinelog
cd /opt/zinelog
docker compose up -d --build
```

更新部署：

```bash
cd /opt/zinelog
git pull
docker compose up -d --build
```

默认会把容器映射到宿主机 `127.0.0.1:4175`，供宿主机 Nginx 反代。

## Nginx 与域名

1. 在 DNS 中添加 `zinelog.rmmark.com -> 服务器公网 IP`
2. 将 [deploy/zinelog.rmmark.conf](/home/huerxiong/code/github.com/zine-log/deploy/zinelog.rmmark.conf) 复制到服务器 `/etc/nginx/sites-available/zinelog.conf`
3. 启用站点并重载 Nginx：

```bash
ln -s /etc/nginx/sites-available/zinelog.conf /etc/nginx/sites-enabled/zinelog.conf
nginx -t
systemctl reload nginx
```

4. 配置 HTTPS：

```bash
certbot --nginx -d zinelog.rmmark.com
```
