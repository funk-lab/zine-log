import type { LibraryImage } from "@/features/editor/types";

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    // 考虑改成URL.createObjectURL(file) 节省内存
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

export async function filesToLibraryImages(
  files: File[],
  nextImageId: number
): Promise<LibraryImage[]> {
  const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));

  return dataUrls.map((src, index) => ({
    id: nextImageId + index,
    src,
    name: files[index].name,
    selected: true,
  }));
}
