import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LibraryImage } from "@/features/editor/types";

interface LibrarySidebarProps {
  images: LibraryImage[];
  totalCount: number;
  selectedCount: number;
  onUpload: (files: FileList | null) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleImage: (imageId: number) => void;
}

export function LibrarySidebar({
  images,
  totalCount,
  selectedCount,
  onUpload,
  onSelectAll,
  onClearSelection,
  onToggleImage,
}: LibrarySidebarProps) {
  return (
    <aside className="flex min-w-0 flex-col border-r bg-card">
      <div className="border-b p-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Library
        </span>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">图库</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          上传图片，选择要参与本次排版的素材。
        </p>
      </div>

      <div className="p-6 pb-4">
        <label className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-slate-400 hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:scale-110">
            <ImagePlus className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Upload Photos
          </span>
          <span className="text-sm leading-6 text-slate-400">支持一次多选，也可以后续继续追加。</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-4">
        <div className="rounded-xl border bg-slate-50 p-3">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">图库总数</span>
          <strong className="mt-1 block text-sm font-semibold text-slate-950">{totalCount} 张</strong>
        </div>
        <div className="rounded-xl border bg-slate-50 p-3">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">用于排版</span>
          <strong className="mt-1 block text-sm font-semibold text-slate-950">{selectedCount} 张</strong>
        </div>
      </div>

      <div className="flex gap-2 px-6 pb-4">
        <Button className="flex-1" size="sm" variant="secondary" onClick={onSelectAll}>
          全选
        </Button>
        <Button className="flex-1" size="sm" variant="ghost" onClick={onClearSelection}>
          清空选择
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-6 pb-6">
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl border bg-slate-100 text-left transition",
                  image.selected
                    ? "border-slate-950 shadow-[inset_0_0_0_1px_#0f172a]"
                    : "border-slate-100 opacity-60",
                )}
                onClick={() => onToggleImage(image.id)}
              >
                <img
                  src={image.src}
                  alt={image.name || `已上传图片 ${index + 1}`}
                  className={cn(
                    "h-full w-full object-cover transition duration-200",
                    image.selected ? "grayscale-0" : "grayscale",
                  )}
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-900">
                  {image.selected ? "用于排版" : "已跳过"}
                </span>
                <span
                  className={cn(
                    "absolute right-2 top-2 h-4 w-4 rounded-full border",
                    image.selected
                      ? "border-slate-950 bg-slate-950"
                      : "border-slate-300 bg-white/90",
                  )}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-500">
            上传照片后，这里会显示图库。点击缩略图即可决定它是否参与当前排版。
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
