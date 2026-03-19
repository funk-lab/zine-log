import { memo, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATE_META } from "@/features/editor/constants";
import { cn } from "@/lib/utils";
import type { TemplateId } from "@/features/editor/types";

interface ToolsSidebarProps {
  template: TemplateId;
  title: string;
  meta: string;
  body: string;
  accent: string;
  onTemplateChange: (template: TemplateId) => void;
  onTitleChange: (value: string) => void;
  onMetaChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAccentChange: (value: string) => void;
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

const PRESET_ACCENTS = [
  "#111827",
  "#b36a3c",
  "#c85c5c",
  "#6b8f71",
  "#4b6cb7",
  "#8c6bb1",
];

function ToolsSidebarComponent({
  template,
  title,
  meta,
  body,
  accent,
  onTemplateChange,
  onTitleChange,
  onMetaChange,
  onBodyChange,
  onAccentChange,
}: ToolsSidebarProps) {
  return (
    <aside className="flex min-w-0 flex-col border-l bg-card xl:min-h-0">
      <div className="border-b px-6 py-5 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">工具栏</h2>
      </div>

      <div className="px-6 py-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto scrollbar-thin">
        <div className="space-y-6 pb-4">
          <section className="space-y-4">
            <strong className="block text-sm font-semibold text-slate-900">模板设置</strong>

            <div className="grid gap-2">
              <Select value={template} onValueChange={(value) => onTemplateChange(value as TemplateId)}>
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
            </div>

            <ToolField label="主题色">
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_ACCENTS.map((presetAccent) => (
                  <button
                    key={presetAccent}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-lg border transition",
                      accent === presetAccent
                        ? "border-slate-950 ring-2 ring-slate-950/10"
                        : "border-slate-200 hover:border-slate-400",
                    )}
                    style={{ backgroundColor: presetAccent }}
                    onClick={() => onAccentChange(presetAccent)}
                    aria-label={`选择主题色 ${presetAccent}`}
                  />
                ))}

                <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white hover:border-slate-400">
                  <span
                    className="h-4 w-4 rounded-full border border-slate-300"
                    style={{
                      background:
                        "conic-gradient(from 180deg, #ff6b6b, #ffd93d, #6bcB77, #4d96ff, #b892ff, #ff6b6b)",
                    }}
                  />
                  <input
                    type="color"
                    value={accent}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) => onAccentChange(event.target.value)}
                  />
                </label>
              </div>
            </ToolField>

          </section>

          <Separator />

          <section className="space-y-4">
            <strong className="block text-sm font-semibold text-slate-900">文字内容</strong>

            <div className="grid grid-cols-2 gap-3">
              <ToolField label="标题">
                <Input
                  value={title}
                  placeholder="例如：春天的午后散步"
                  onChange={(event) => onTitleChange(event.target.value)}
                />
              </ToolField>
              <ToolField label="副标题">
                <Input
                  value={meta}
                  placeholder="例如：2026.03.17 · 上海"
                  onChange={(event) => onMetaChange(event.target.value)}
                />
              </ToolField>
            </div>

            <ToolField label="正文">
              <Textarea
                value={body}
                placeholder="写几句生活记录，也可以留空，只保留图片。"
                onChange={(event) => onBodyChange(event.target.value)}
              />
            </ToolField>
          </section>
        </div>
      </div>
    </aside>
  );
}

export const ToolsSidebar = memo(ToolsSidebarComponent);
