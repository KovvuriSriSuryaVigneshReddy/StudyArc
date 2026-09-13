import JSZip from "jszip";

export interface ParsedFileResult {
  text: string;
  fileName: string;
  fileSize: number;
  type: "pdf" | "pptx" | "txt" | "unknown";
  slideCount?: number;
  pageCount?: number;
}

/**
 * Extracts plain text from a TXT or Markdown file.
 *
 * @param file - The uploaded plain text or markdown File object.
 * @returns A promise resolving to a ParsedFileResult with cleaned text content.
 * @throws {Error} If reading the file stream fails.
 * @example
 * ```ts
 * const result = await parseTextFile(textFile);
 * console.log(result.text);
 * ```
 */
export async function parseTextFile(file: File): Promise<ParsedFileResult> {
  const text = await file.text();
  return {
    text: text.trim(),
    fileName: file.name,
    fileSize: file.size,
    type: "txt",
  };
}

/**
 * Extracts text from a PPTX presentation by unzipping and reading slide XML streams.
 *
 * @param file - The uploaded Microsoft PowerPoint (.pptx) File object.
 * @returns A promise resolving to a ParsedFileResult containing slide text and slide count.
 * @throws {Error} If the ZIP archive is corrupt or contains no readable text slides.
 * @example
 * ```ts
 * const result = await parsePptxFile(presentationFile);
 * console.log(`Parsed ${result.slideCount} slides`);
 * ```
 */
export async function parsePptxFile(file: File): Promise<ParsedFileResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find slide files: ppt/slides/slide1.xml, slide2.xml, etc.
    const slideFiles = Object.keys(zip.files)
      .filter((filename) => /^ppt\/slides\/slide\d+\.xml$/i.test(filename))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0], 10);
        const numB = parseInt(b.match(/\d+/)![0], 10);
        return numA - numB;
      });

    if (slideFiles.length === 0) {
      throw new Error("No readable slides found in this presentation.");
    }

    const slideTexts: string[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
      const slidePath = slideFiles[i];
      const xmlContent = await zip.files[slidePath].async("text");
      
      // Extract all <a:t>...</a:t> text elements
      const textMatches = xmlContent.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
      const extractedWords = textMatches
        .map((tag) => tag.replace(/<[^>]+>/g, "").trim())
        .filter((w) => w.length > 0);

      if (extractedWords.length > 0) {
        slideTexts.push(`--- Slide ${i + 1} ---\n` + extractedWords.join(" "));
      }
    }

    const combinedText = slideTexts.join("\n\n");
    if (!combinedText.trim()) {
      throw new Error("Extracted slide contents appear to be empty or image-only.");
    }

    return {
      text: combinedText,
      fileName: file.name,
      fileSize: file.size,
      type: "pptx",
      slideCount: slideFiles.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse PPTX file";
    throw new Error(`PPTX extraction error: ${message}`);
  }
}

/**
 * Extracts text from PDF files using client-side binary stream scanning.
 *
 * @param file - The uploaded Adobe PDF File object.
 * @returns A promise resolving to a ParsedFileResult with extracted text.
 * @throws {Error} If parsing fails or the PDF contains purely scanned/unextractable imagery.
 * @example
 * ```ts
 * const result = await parsePdfFile(pdfFile);
 * console.log(result.text.slice(0, 100));
 * ```
 */
export async function parsePdfFile(file: File): Promise<ParsedFileResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Use TextDecoder with latin1 / binary replacement for raw byte parsing
    const decoder = new TextDecoder("latin1");
    const rawContent = decoder.decode(bytes);

    // Pattern 1: Search for text within PDF text objects (BT ... ET)
    const textBlocks: string[] = [];
    
    // Extract text in parentheses (Tj and TJ operators)
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(rawContent)) !== null) {
      const cleaned = match[1]
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\[nrtbf]/g, " ")
        .trim();
      if (cleaned.length > 0) {
        textBlocks.push(cleaned);
      }
    }

    // Also look for array TJ operators: [(str) 10 (str)] TJ
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(rawContent)) !== null) {
      const inner = match[1];
      const strMatches = inner.match(/\(([^)]+)\)/g) || [];
      const line = strMatches
        .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, "$1"))
        .join("")
        .trim();
      if (line.length > 0) {
        textBlocks.push(line);
      }
    }

    let extractedText = textBlocks.join(" ").replace(/\s+/g, " ").trim();

    // Fallback: If compressed stream prevented direct regex, extract printable ASCII sequences
    if (extractedText.length < 50) {
      const asciiMatches = rawContent.match(/[A-Z0-9][A-Za-z0-9 ,.;:!?'"()\-–—\n\r]{4,}/g) || [];
      const filtered = asciiMatches
        .filter((s) => !s.startsWith("obj") && !s.startsWith("endobj") && !s.includes("Font") && !s.includes("MediaBox"))
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
      extractedText = filtered.join("\n");
    }

    if (!extractedText || extractedText.length < 30) {
      throw new Error(
        "PDF appears to contain scanned images or encrypted streams. For best results, please paste the lecture text directly into the 'Pasted Notes' tab."
      );
    }

    return {
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      type: "pdf",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to extract PDF text";
    throw new Error(message);
  }
}

/**
 * Universal file ingestion dispatcher that delegates to the appropriate extractor
 * based on the file extension (.txt, .md, .pptx, .pdf).
 *
 * @param file - The uploaded File object.
 * @returns A promise resolving to the unified ParsedFileResult.
 * @throws {Error} If extraction fails for the targeted format.
 * @example
 * ```ts
 * const parsed = await parseUploadedFile(userFile);
 * ```
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "txt":
    case "md":
    case "markdown":
      return parseTextFile(file);
    case "pptx":
      return parsePptxFile(file);
    case "pdf":
      return parsePdfFile(file);
    default:
      // Try text reading as general fallback
      return parseTextFile(file);
  }
}
