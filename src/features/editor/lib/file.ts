import type { GalleryImage } from "@/features/editor/types";

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    // TODO: 考虑改成 URL.createObjectURL(file) 节省内存
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unexpected file result"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export async function filesToGalleryImages(
  files: File[],
): Promise<Omit<GalleryImage, "id">[]> {
  const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));

  return dataUrls.map((src, index) => ({
    src,
    name: files[index].name,
    uploadedAt: Date.now(),
  }));
}
