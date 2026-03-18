import type { TemplateId, TemplateMeta } from "@/features/editor/types";

export const TEMPLATE_META: Record<TemplateId, TemplateMeta> = {
  "l-shape": {
    name: "L 型回纹",
    hint: "适合一张主图加短文案的编排。",
  },
  editorial: {
    name: "留白日记",
    hint: "大图、留白与正文并置，偏杂志页结构。",
  },
  poster: {
    name: "拼贴栏位",
    hint: "更像海报，适合多图和大标题。",
  },
  "l-style": {
    name: "照片环",
    hint: "多张正方形图片从中心向外形成回环。",
  },
};
