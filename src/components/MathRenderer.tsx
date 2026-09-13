"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  text?: string | null;
  className?: string;
  isBlock?: boolean;
}

// Regex to capture $$...$$ (block math) and $...$ (inline math)
const DELIMITED_MATH_REGEX = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;

// Regex to capture raw LaTeX control sequences and common equation notations outside $ delimiters:
// 1. LaTeX commands with optional bracketed arguments: \frac{a}{b}, \sigma, \alpha, \sum_{i=1}^n, \partial, etc.
// 2. Variable superscripts / subscripts: x^2, W^{[l]}, a^{(i)}, \delta^{[l]}
// 3. Standalone superscripts / subscripts: ^{[l]}, _{i}
const RAW_MATH_REGEX =
  /(\\[a-zA-Z]+(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\^\{[^{}]*\}|_[a-zA-Z0-9]+|\^[a-zA-Z0-9]+)*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*|\b[a-zA-Z0-9]+(?:\^\{[^{}]*\}|\^[0-9a-zA-Z]+|\_\{[^{}]*\}|_[0-9a-zA-Z]+)+|\^\{[^{}]*\}|\_\{[^{}]*\})/g;

interface RenderedSegment {
  key: string;
  isMath: boolean;
  isBlock: boolean;
  content: string;
  html?: string;
}

// Global in-memory cache for rendered KaTeX HTML strings
const KATEX_CACHE_LIMIT = 1000;
const katexHtmlCache = new Map<string, string>();

function getCachedKatexHtml(content: string, isBlock: boolean): string {
  const cacheKey = `${isBlock ? "b" : "i"}:${content}`;
  const cached = katexHtmlCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const html = katex.renderToString(content, {
      throwOnError: false,
      displayMode: isBlock,
      output: "htmlAndMathml",
    });

    if (katexHtmlCache.size >= KATEX_CACHE_LIMIT) {
      // Evict oldest 100 entries when cache limit is exceeded
      const keysToEvict = Array.from(katexHtmlCache.keys()).slice(0, 100);
      for (const k of keysToEvict) {
        katexHtmlCache.delete(k);
      }
    }

    katexHtmlCache.set(cacheKey, html);
    return html;
  } catch (err: unknown) {
    // Return empty to trigger plain text fallback
    return "";
  }
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = "",
  isBlock: defaultBlock = false,
}) => {
  const segments = useMemo<RenderedSegment[]>(() => {
    if (!text) return [];

    const stringText = String(text);
    const result: RenderedSegment[] = [];
    let segIndex = 0;

    // Check if the entire string is explicitly enclosed in $$ or if isBlock is set
    if (defaultBlock && !stringText.includes("$")) {
      const content = stringText.trim();
      return [
        {
          key: `whole-block-0`,
          isMath: true,
          isBlock: true,
          content,
          html: getCachedKatexHtml(content, true),
        },
      ];
    }

    // Split by explicit $...$ or $$...$$ delimiters
    const parts = stringText.split(DELIMITED_MATH_REGEX);

    for (const part of parts) {
      if (!part) continue;

      if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
        // Block math ($$...$$)
        const content = part.slice(2, -2).trim();
        result.push({
          key: `block-${segIndex++}`,
          isMath: true,
          isBlock: true,
          content,
          html: getCachedKatexHtml(content, true),
        });
      } else if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
        // Inline math ($...$)
        const content = part.slice(1, -1).trim();
        result.push({
          key: `inline-${segIndex++}`,
          isMath: true,
          isBlock: false,
          content,
          html: getCachedKatexHtml(content, false),
        });
      } else {
        // Plain text segment: check for raw LaTeX syntax (e.g. \sigma, x^2, \frac{a}{b}, W^{[l]})
        const rawParts = part.split(RAW_MATH_REGEX);
        for (const rawPart of rawParts) {
          if (!rawPart) continue;

          // Check if this subsegment matches our raw math criteria
          if (
            rawPart.startsWith("\\") ||
            /^[a-zA-Z0-9]+(?:\^\{[^{}]*\}|\^[0-9a-zA-Z]+|\_\{[^{}]*\}|_[0-9a-zA-Z]+)+$/.test(rawPart) ||
            /^\^\{[^{}]*\}$|^\_\{[^{}]*\}$/.test(rawPart)
          ) {
            const content = rawPart.trim();
            result.push({
              key: `raw-math-${segIndex++}`,
              isMath: true,
              isBlock: false,
              content,
              html: getCachedKatexHtml(content, false),
            });
          } else {
            result.push({
              key: `text-${segIndex++}`,
              isMath: false,
              isBlock: false,
              content: rawPart,
            });
          }
        }
      }
    }

    return result;
  }, [text, defaultBlock]);

  if (!text) return null;

  return (
    <span className={`math-renderer-root ${className}`}>
      {segments.map((seg) => {
        if (!seg.isMath) {
          return <React.Fragment key={seg.key}>{seg.content}</React.Fragment>;
        }

        if (seg.html) {
          if (seg.isBlock) {
            return (
              <span
                key={seg.key}
                className="block my-2 overflow-x-auto text-center font-serif text-cyan-200"
                dangerouslySetInnerHTML={{ __html: seg.html }}
              />
            );
          }

          return (
            <span
              key={seg.key}
              className="inline-block px-0.5 align-baseline text-cyan-200"
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          );
        }

        // Fallback gracefully to raw text if parsing failed
        return <span key={seg.key}>{seg.content}</span>;
      })}
    </span>
  );
};

export default React.memo(MathRenderer);
