# Repository Guidelines

todo

## Project Structure & Module Organization

This repository is intentionally small at the moment. The tracked files are [README.md](/home/huerxiong/code/github.com/zine-log/README.md) and [.gitignore](/home/huerxiong/code/github.com/zine-log/.gitignore). Keep contributor-facing documentation at the repository root until a larger codebase exists.

When adding source code, group it by purpose instead of by file type. For example, place application code in `src/`, tests in `tests/`, and static assets in `assets/` or `public/`. Keep the top level uncluttered and update this guide when the layout changes.

## Build, Test, and Development Commands

No build system, package manifest, or test runner is configured yet. For now, contributors should rely on basic repository checks:

- `git status` checks the working tree before and after changes.
- `rg --files` lists tracked-style paths quickly when exploring the repo.
- `git log --oneline` shows the current commit style and recent history.

If you introduce a toolchain such as `npm`, `pytest`, or `make`, document the exact setup and add the canonical commands here in the same change.

## Coding Style & Naming Conventions

Prefer small, focused files and descriptive names. Use lowercase, kebab-case filenames for Markdown and configuration files unless a tool requires another convention. Match the formatter and linter of the language you add; do not mix styles within the same module.

Keep documentation concise and actionable. Use Markdown headings, short paragraphs, and examples such as `src/feature_name/` or `tests/test_feature.py`.

## Testing Guidelines

There is no test framework or coverage gate yet. Any new feature should include a repeatable verification path, either as automated tests or explicit manual reproduction steps in the pull request.

Name tests after the behavior they cover, for example `tests/test_entry_creation.py` or `src/feature/feature.test.ts`.

## Commit & Pull Request Guidelines

Current history uses short, imperative commit subjects such as `add .gitignore` and `first commit`. Follow that pattern: one line, lowercase is acceptable, and focus on the change itself.

Pull requests should explain what changed, why it changed, and how it was verified. Link related issues when applicable and include screenshots only for UI or rendered-documentation changes.

## Security & Configuration Tips

Do not commit secrets, local environments, or generated artifacts. The current ignore rules already exclude `node_modules/`, `venv/`, `env/`, `*.pyc`, and `__pycache__/`; extend them carefully when new tooling is added.

## Code Quality & Refactoring Guidelines (Post-2026-04-14)

### Type System

- 统一使用 `GalleryImage` 作为图片数据类型
- 废弃的 `LibraryImage` 类型将在后续版本中移除
- 类型定义应与实际数据结构保持一致

### Error Handling

- 避免在生产代码中使用 `console.log` 输出调试信息
- 错误处理应提供用户友好的反馈（如 UI 提示）
- 保留 `console.error` 仅用于开发调试，需配合用户提示使用

### Code Comments

- 使用 `// TODO: [描述]` 标记未实现功能
- 使用 `// FIXME: [描述]` 标记已知问题
- 废弃代码使用 `// @deprecated [替代方案]` 标记

### Testing Requirements

- 每个功能模块需有对应的单元测试（`.test.ts`）
- 核心功能测试覆盖率目标 > 80%
- 新增功能必须包含测试用例

### Module Organization (src/features)

- `editor/` - 编辑器核心功能（Reducer + 组件）
- `export/` - 导出功能（PDF/PNG/SVG）
- `preview3d/` - 3D 预览（React Three Fiber）
- `rendering/` - 渲染工具（SVG 转 Canvas）
- `templates/` - 模板渲染

### File Naming Conventions

- React 组件: PascalCase (e.g., `PhotoGallery.tsx`)
- 工具函数: camelCase (e.g., `editor-reducer.ts`)
- 测试文件: 与被测文件同名 + `.test.ts`
- 样式文件: 与组件同名 + `.css`
