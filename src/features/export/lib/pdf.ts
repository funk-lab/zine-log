function stringToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return merged;
}

export function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

interface PdfOptions {
  imageBytes: Uint8Array;
  imageWidth: number;
  imageHeight: number;
  pageWidth: number;
  pageHeight: number;
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
}

export function createPdfBytes({
  imageBytes,
  imageWidth,
  imageHeight,
  pageWidth,
  pageHeight,
  drawWidth,
  drawHeight,
  offsetX,
  offsetY,
}: PdfOptions) {
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let cursor = 0;

  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    cursor += bytes.length;
  };

  const pushString = (value: string) => {
    push(stringToBytes(value));
  };

  pushString("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  const addObject = (objectNumber: number, bodyBytes: Uint8Array) => {
    offsets[objectNumber] = cursor;
    pushString(`${objectNumber} 0 obj\n`);
    push(bodyBytes);
    pushString("\nendobj\n");
  };

  addObject(1, stringToBytes("<< /Type /Catalog /Pages 2 0 R >>"));
  addObject(2, stringToBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));

  addObject(
    3,
    stringToBytes(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`,
    ),
  );

  const imageObjectHeader = stringToBytes(
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
  );
  const imageObjectFooter = stringToBytes("\nendstream");
  addObject(4, concatBytes([imageObjectHeader, imageBytes, imageObjectFooter]));

  const contentStream = stringToBytes(
    `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im0 Do\nQ`,
  );
  const contentHeader = stringToBytes(`<< /Length ${contentStream.length} >>\nstream\n`);
  const contentFooter = stringToBytes("\nendstream");
  addObject(5, concatBytes([contentHeader, contentStream, contentFooter]));

  const xrefOffset = cursor;
  pushString("xref\n0 6\n");
  pushString("0000000000 65535 f \n");

  for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
    pushString(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }

  pushString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return concatBytes(chunks);
}
