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

interface Segment {
  key: string;
  isMath: boolean;
  isBlock: boolean;
  content: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = "",
  isBlock: defaultBlock = false,
}) => {
  const segments = useMemo<Segment[]>(() => {
    if (!text) return [];

    const stringText = String(text);
    const result: Segment[] = [];
    let segIndex = 0;

    // Check if the entire string is explicitly enclosed in $$ or if isBlock is set
    if (defaultBlock && !stringText.includes("$")) {
      return [
        {
          key: `whole-block-0`,
          isMath: true,
          isBlock: true,
          content: stringText.trim(),
        },
      ];
    }

    // Split by explicit $...$ or $$...$$ delimiters
    const parts = stringText.split(DELIMITED_MATH_REGEX);

    for (const part of parts) {
      if (!part) continue;

      if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
        // Block math ($$...$$)
        result.push({
          key: `block-${segIndex++}`,
          isMath: true,
          isBlock: true,
          content: part.slice(2, -2).trim(),
        });
      } else if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
        // Inline math ($...$)
        result.push({
          key: `inline-${segIndex++}`,
          isMath: true,
          isBlock: false,
          content: part.slice(1, -1).trim(),
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
            result.push({
              key: `raw-math-${segIndex++}`,
              isMath: true,
              isBlock: false,
              content: rawPart.trim(),
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

        try {
          const html = katex.renderToString(seg.content, {
            throwOnError: false,
            displayMode: seg.isBlock,
            output: "htmlAndMathml",
          });

          if (seg.isBlock) {
            return (
              <span
                key={seg.key}
                className="block my-2 overflow-x-auto text-center font-serif text-cyan-200"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }

          return (
            <span
              key={seg.key}
              className="inline-block px-0.5 align-baseline text-cyan-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (err) {
          console.warn("KaTeX render error on:", seg.content, err);
          // Fallback: gracefully render the raw text without breaking the UI
          return <span key={seg.key}>{seg.content}</span>;
        }
      })}
    </span>
  );
};

export default MathRenderer;
