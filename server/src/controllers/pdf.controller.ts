import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { extractPdfText } from "../services/pdf.service";
import { chunkText } from "../services/chunk.service";

export async function extractPdf(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await extractPdfText(
      req.file.buffer
    );

    const allChunks = [];

    for (const page of result.pages) {
      const pageChunks = chunkText(
        page.text,
        page.pageNumber
      );

      allChunks.push(...pageChunks);
    }

    return res.json({
      pages: result.pages,
      characters: result.text.length,
      chunks: allChunks.length,
      preview: allChunks.slice(0, 3),
    });
  } catch (error) {
    console.error("PDF PROCESSING ERROR:", error);

    return res.status(500).json({
      message: "Failed to process PDF",
    });
  }
}