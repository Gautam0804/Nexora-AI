export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
}

export function chunkText(
  text: string,
  pageNumber: number,
  chunkSize = 1000,
  overlap = 150
): TextChunk[] {
  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end).trim();

    if (content) {
      chunks.push({
        content,
        chunkIndex,
        pageNumber,
      });

      chunkIndex++;
    }

    if (end >= text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}