import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

interface ExtractedPDFData {
  text: string;
  numPages: number;
  info: any;
  metadata: any;
}

/**
 * Extract text content from PDF buffer using pdfjs-dist
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<ExtractedPDFData> {
  try {
    console.log('🔍 Starting PDF text extraction with pdfjs-dist...');

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    console.log(`📄 PDF loaded with ${pdfDoc.numPages} pages`);

    let fullText = '';

    // Extract text from each page with positioning
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Sort text items by position (top to bottom, left to right)
      const sortedItems = textContent.items
        .filter((item: any) => item.str && item.str.trim()) // Filter empty strings
        .sort((a: any, b: any) => {
          // Sort by y position first (top to bottom), then x position (left to right)
          const yDiff = Math.abs(b.transform[5] - a.transform[5]);
          if (yDiff > 3) { // Smaller threshold for better line detection
            return b.transform[5] - a.transform[5]; // Sort by Y position (top to bottom)
          }
          return a.transform[4] - b.transform[4]; // Sort by X position (left to right)
        });

      // Group items by lines based on Y position
      const lines: string[] = [];
      let currentLine = '';
      let lastY = -1;

      for (const item of sortedItems) {
        const y = Math.round(item.transform[5]);
        const text = item.str.trim();

        if (lastY === -1 || Math.abs(y - lastY) > 3) {
          // New line detected
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = text;
          lastY = y;
        } else {
          // Same line, add space if needed
          if (currentLine && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
            currentLine += ' ';
          }
          currentLine += text;
        }
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      const pageText = lines.join('\n');
      fullText += pageText + '\n';
      console.log(`📝 Extracted ${pageText.length} characters from page ${pageNum} (${lines.length} lines)`);
    }

    console.log('✅ PDF text extraction completed');
    console.log(`📝 Total text length: ${fullText.length} characters`);

    // Get document info
    const info = await pdfDoc.getMetadata();

    return {
      text: fullText,
      numPages: pdfDoc.numPages,
      info: info.info,
      metadata: info.metadata
    };
  } catch (error) {
    console.error('❌ PDF text extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clean and normalize text extracted from PDF
 */
export function cleanPDFText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

/**
 * Split PDF text into lines and clean them
 */
export function getPDFLines(text: string): string[] {
  return cleanPDFText(text)
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}