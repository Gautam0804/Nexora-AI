import { PDFParse } from "pdf-parse";

export interface PdfPage {
  pageNumber: number;
  text: string;
}

export interface PdfExtractionResult {
  text: string;
  pages: PdfPage[];
}

export async function extractPdfText(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    const pages: PdfPage[] = result.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text,
    }));

    return {
      text: result.text,
      pages,
    };
  } finally {
    await parser.destroy();
  }
}