import { memo } from "react";
import { Check, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface LibraryThumbProps {
  id: number;
  src: string;
  name: string;
  index: number;
  selected: boolean;
  onToggleImage: (imageId: number) => void;
}

const LibraryThumb = memo(function LibraryThumb({
  id,
  src,
  name,
  index,
  selected,
  onToggleImage,
}: LibraryThumbProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border bg-slate-100 text-left transition",
        selected
          ? "border-emerald-300 shadow-[inset_0_0_0_1px_#86efac]"
          : "border-slate-200",
      )}
      onClick={() => onToggleImage(id)}
    >
      <img
        src={src}
        alt={name || `已上传图片 ${index + 1}`}
        className="h-full w-full object-cover transition duration-200"
        loading="lazy"
        decoding="async"
      />
      {selected ? (
        <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </button>
  );
});

function LibrarySidebarComponent({
  images,
  totalCount,
  selectedCount,
  onUpload,
  onSelectAll,
  onClearSelection,
  onToggleImage,
}: LibrarySidebarProps) {
  return (
    <aside className="flex min-w-0 flex-col border-r bg-card xl:min-h-0">
      <div className="border-b px-6 py-5 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-950">图库</h1>
      </div>

      <div className="px-6 py-4">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />
          <span className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
            <ImagePlus className="h-4 w-4" />
            上传图片
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-4">
        <div className="rounded-xl border bg-slate-50 p-3">
          <strong className="block text-sm font-semibold text-slate-950">全部 {totalCount} 张</strong>
        </div>
        <div className="rounded-xl border bg-slate-50 p-3">
          <strong className="block text-sm font-semibold text-slate-950">已选 {selectedCount} 张</strong>
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

      <div className="px-6 pb-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto scrollbar-thin">
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 pb-1">
            {images.map((image, index) => (
              <LibraryThumb
                key={image.id}
                id={image.id}
                src={image.src}
                name={image.name}
                index={index}
                selected={image.selected}
                onToggleImage={onToggleImage}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-500">
            上传照片后，这里会显示图库。点击缩略图即可决定它是否参与当前排版。
          </div>
        )}
      </div>
    </aside>
  );
}

export const LibrarySidebar = memo(LibrarySidebarComponent);
