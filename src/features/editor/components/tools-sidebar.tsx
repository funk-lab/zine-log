import type { ChangeEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATE_META } from "@/features/editor/constants";
import type { EditorState, TemplateId } from "@/features/editor/types";

interface ToolsSidebarProps {
  state: EditorState;
  onTemplateChange: (template: TemplateId) => void;
  onTitleChange: (value: string) => void;
  onMetaChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onRingScaleChange: (value: number) => void;
  onFillExample: () => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onDownloadPdf: () => void;
}

function ToolField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function ToolsSidebar({
  state,
  onTemplateChange,
  onTitleChange,
  onMetaChange,
  onBodyChange,
  onAccentChange,
  onRingScaleChange,
  onFillExample,
  onDownloadPng,
  onDownloadSvg,
  onDownloadPdf,
}: ToolsSidebarProps) {
  return (
    <aside className="flex min-w-0 flex-col border-l bg-card">
      <div className="border-b p-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Tools
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">工具栏</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          模板、文案、导出与后续功能统一放在这里。
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-6 py-6">
        <div className="space-y-6 pb-4">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-900">快捷操作</strong>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Quick Fill
              </span>
            </div>
            <Button className="w-full" variant="ghost" onClick={onFillExample}>
              填入示例内容
            </Button>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-900">模板设置</strong>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Layouts
              </span>
            </div>

            <ToolField label="模板">
              <Select value={state.template} onValueChange={(value) => onTemplateChange(value as TemplateId)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择模板" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_META).map(([template, meta]) => (
                    <SelectItem key={template} value={template}>
                      {meta.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ToolField>

            {state.template === "l-style" ? (
              <ToolField label="照片环大小">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>当前大小</span>
                    <strong className="text-slate-900">{Math.round(state.ringScale * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={125}
                    value={Math.round(state.ringScale * 100)}
                    className="accent-slate-950"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      onRingScaleChange(Number(event.target.value) / 100)
                    }
                  />
                </div>
              </ToolField>
            ) : null}
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-900">文字内容</strong>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Typography
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ToolField label="标题">
                <Input
                  value={state.title}
                  placeholder="例如：春天的午后散步"
                  onChange={(event) => onTitleChange(event.target.value)}
                />
              </ToolField>
              <ToolField label="副标题">
                <Input
                  value={state.meta}
                  placeholder="例如：2026.03.17 · 上海"
                  onChange={(event) => onMetaChange(event.target.value)}
                />
              </ToolField>
            </div>

            <ToolField label="正文">
              <Textarea
                value={state.body}
                placeholder="写几句生活记录，也可以留空，只保留图片。"
                onChange={(event) => onBodyChange(event.target.value)}
              />
            </ToolField>

            <ToolField label="主题色">
              <Input
                type="color"
                value={state.accent}
                className="h-12 p-1"
                onChange={(event) => onAccentChange(event.target.value)}
              />
            </ToolField>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-900">导出</strong>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Export
              </span>
            </div>

            <div className="grid gap-3">
              <Button className="w-full" onClick={onDownloadPng}>
                下载 PNG
              </Button>
              <Button className="w-full" variant="secondary" onClick={onDownloadSvg}>
                下载 SVG
              </Button>
              <Button className="w-full" variant="ghost" onClick={onDownloadPdf}>
                下载 PDF
              </Button>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-900">后续能力</strong>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Coming Next
              </span>
            </div>
            <div className="space-y-3">
              <article className="rounded-xl border bg-slate-50 p-4">
                <strong className="block text-base font-semibold text-slate-950">图片编辑</strong>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  后续接入裁切、缩放、滤镜和局部调整。
                </p>
              </article>
              <article className="rounded-xl border bg-slate-50 p-4">
                <strong className="block text-base font-semibold text-slate-950">3D 预览</strong>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  后续在中间画布增加立体翻页和场景式预览。
                </p>
              </article>
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}
