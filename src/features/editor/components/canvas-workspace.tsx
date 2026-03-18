import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { TemplateMeta } from "@/features/editor/types";

interface CanvasWorkspaceProps {
  svgMarkup: string;
  aspectRatio: string;
  selectedCount: number;
  templateMeta: TemplateMeta;
  templateName: string;
  templateButtons: ReactNode;
}

export function CanvasWorkspace({
  svgMarkup,
  aspectRatio,
  selectedCount,
  templateMeta,
  templateName,
  templateButtons,
}: CanvasWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-col bg-slate-50">
      <div className="flex h-12 items-center justify-between gap-4 border-b bg-white/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Page 1
          </span>
          <strong className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Editor Canvas
          </strong>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">模板 {templateName}</Badge>
          <Badge variant="outline">已选 {selectedCount} 张</Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-8 scrollbar-thin">
        <div className="mx-auto w-full max-w-[760px] rounded-[28px] bg-slate-200 p-6 shadow-inner">
          <div
            className="w-full overflow-hidden bg-white shadow-canvas"
            style={{ aspectRatio }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t bg-white px-6 py-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Template Preview
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{templateMeta.name}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{templateMeta.hint}</p>
        </div>
        <div className="flex flex-wrap gap-2">{templateButtons}</div>
      </div>
    </section>
  );
}
