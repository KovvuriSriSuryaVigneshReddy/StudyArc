import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  GeminiApiResponse,
  GeminiGeneratedPayload,
  GeminiQuizQuestion,
  GeminiExamTrap,
  StudyStudioData,
} from "@/types";

/** Maximum permitted lecture text character payload (25,000 characters) */
const MAX_CONTENT_LENGTH = 25000;

/**
 * Handles lecture note analysis and revision studio generation via Google Gemini.
 * Enforces:
 * - 5 requests/min sliding window rate limit per client IP.
 * - Max 25,000 character payload length.
 * - Secure header-based API key transmission (`x-goog-api-key`).
 * - Multi-model fallback across `gemini-3.6-flash`, `gemini-3.5-flash-lite`, and `gemini-flash-latest`.
 * - Strict JSON schema output normalization.
 *
 * @param req - NextRequest containing JSON body `{ content, subjectMode, difficulty, apiKey }`
 * @returns NextResponse containing normalized `StudyStudioData` or error payload.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. IP-based Rate Limiting (5 requests per minute)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : req.ip || "127.0.0.1";
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before generating again." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          },
        }
      );
    }

    const body = (await req.json()) as {
      content?: string;
      subjectMode?: string;
      difficulty?: string;
      apiKey?: string;
    };
    const { content, subjectMode, difficulty, apiKey: clientApiKey } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key missing. Please provide a GEMINI_API_KEY in .env.local or enter it in the header." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "No lecture content provided to analyze." },
        { status: 400 }
      );
    }

    // 3. Input Size Limit (max 25,000 characters)
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Input exceeds maximum allowed size of ${MAX_CONTENT_LENGTH.toLocaleString()} characters.` },
        { status: 400 }
      );
    }

    const systemPrompt = `You are StudyArc.ai, an expert academic tutor and exam architect.
Analyze the lecture text provided and extract a high-yield study package according to these specifications:
- Subject Mode: ${subjectMode || "General / STEM"} (if STEM, emphasize formulas, derivations, and algorithmic steps; if Humanities, emphasize definitions, arguments, and critique)
- Target Difficulty: ${difficulty || "Quick Cram"}

MATHEMATICAL NOTATION REQUIREMENT:
When generating formulas, scientific equations, superscripts, or mathematical expressions (e.g. x^2, derivatives, matrices, greek letters), always enclose them in single dollar signs for inline math (e.g. $x^2$, $\\delta^{[l]}$, $\\sigma(z)$) or double dollar signs for standalone equations ($$...$$).

CRITICAL REQUIREMENT: Return strictly valid raw JSON without any markdown code fence wrappers (no \`\`\`json or \`\`\`). The JSON structure must match this exact schema:
{
  "topic": "Concise Subject / Topic Name",
  "readTimeMinutes": 5,
  "executiveSummary": "2-3 punchy, high-yield paragraphs summarizing the core thesis and practical intuition.",
  "highYieldTakeaways": [
    "High-yield concept point 1",
    "High-yield concept point 2",
    "High-yield concept point 3",
    "High-yield concept point 4",
    "High-yield concept point 5"
  ],
  "keyFormulasOrDefinitions": [
    { "term": "Concept / Formula Name", "definition": "Clear explanation, equation, or application rule." }
  ],
  "trapsAndGotchas": [
    {
      "concept": "Specific concept, formula, or law",
      "commonTrap": "The typical distractor, trick assumption, or edge-case mistake professors test on to trip up students.",
      "proTip": "Concrete memory hook or verification step to guarantee full marks."
    }
  ],
  "practiceQuiz": [
    {
      "id": 1,
      "question": "Clear multiple-choice practice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}`;

    // 3. Native Gemini system_instruction parameter (mitigates prompt injection)
    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: `--- LECTURE MATERIAL ---\n${content}` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    };

    const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
    let response: Response | null = null;
    let lastErrorDetails = "";

    for (const model of modelsToTry) {
      // 4. Secure API key transmission: strict header transmission via x-goog-api-key (removed from URL query)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(geminiPayload),
        });

        if (res.ok) {
          response = res;
          break;
        } else {
          const errText = await res.text();
          lastErrorDetails = `Model ${model} returned status ${res.status}: ${errText}`;
          console.error("Gemini API upstream error:", lastErrorDetails);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        lastErrorDetails = `Network error calling ${model}: ${message}`;
        console.error("Gemini API network exception:", lastErrorDetails);
      }
    }

    // 5. Sanitized Error Response: do not return internal upstream errors or stack traces to client
    if (!response || !response.ok) {
      console.error("All Gemini model attempts failed. Last error:", lastErrorDetails);
      return NextResponse.json(
        { error: "Failed to generate study materials. Please verify your API key and try again." },
        { status: 502 }
      );
    }

    const result = (await response.json()) as GeminiApiResponse;
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Empty content in Gemini response candidate parts:", JSON.stringify(result));
      return NextResponse.json(
        { error: "Model returned an empty response. Please retry with more detailed notes." },
        { status: 502 }
      );
    }

    // Clean potential markdown delimiters if present
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsed: GeminiGeneratedPayload;
    try {
      parsed = JSON.parse(cleaned) as GeminiGeneratedPayload;
    } catch (parseErr) {
      console.error("JSON parse error on model output:", parseErr, cleaned);
      return NextResponse.json(
        { error: "Model returned malformed data. Please retry." },
        { status: 502 }
      );
    }

    const questions = (parsed.practiceQuiz || parsed.practice_quiz || []).map((q: GeminiQuizQuestion, idx: number) => ({
      id: q.id ?? idx + 1,
      question: q.question || "",
      options: q.options || [],
      correct_index: q.correct_index ?? q.correctIndex ?? 0,
      correctIndex: q.correct_index ?? q.correctIndex ?? 0,
      explanation: q.explanation || "",
    }));

    const rawTraps = parsed.trapsAndGotchas || parsed.traps_and_gotchas || [];
    const traps = Array.isArray(rawTraps) && rawTraps.length > 0
      ? rawTraps.map((t: GeminiExamTrap) => ({
          concept: t.concept || "High-Yield Exam Trap",
          commonTrap: t.commonTrap || t.common_trap || "Common distractor or tricky sign error.",
          common_trap: t.commonTrap || t.common_trap || "Common distractor or tricky sign error.",
          proTip: t.proTip || t.pro_tip || "Carefully verify boundary constraints and initial states.",
          pro_tip: t.proTip || t.pro_tip || "Carefully verify boundary constraints and initial states.",
        }))
      : [
          {
            concept: "Boundary Conditions & Edge Cases",
            commonTrap: "Assuming general-case principles hold across extreme limits (zero/infinite boundaries).",
            common_trap: "Assuming general-case principles hold across extreme limits (zero/infinite boundaries).",
            proTip: "Explicitly test edge-case inputs (n=0, empty arrays, sign transitions) before finalizing responses.",
            pro_tip: "Explicitly test edge-case inputs (n=0, empty arrays, sign transitions) before finalizing responses.",
          },
          {
            concept: "Unit & Dimensional Scaling",
            commonTrap: "Mixing metric and imperial multipliers or failing to convert angular radians to degrees.",
            common_trap: "Mixing metric and imperial multipliers or failing to convert angular radians to degrees.",
            proTip: "Perform dimensional cancellation across terms to verify equations have identical physical dimensions.",
            pro_tip: "Perform dimensional cancellation across terms to verify equations have identical physical dimensions.",
          },
          {
            concept: "Correlation vs. Direct Mechanism",
            commonTrap: "Citing concurrent associations instead of articulating the step-by-step causal mechanism.",
            common_trap: "Citing concurrent associations instead of articulating the step-by-step causal mechanism.",
            proTip: "Structure short-answer arguments with 'Mechanism -> Cause -> Observed Effect' for full points.",
            pro_tip: "Structure short-answer arguments with 'Mechanism -> Cause -> Observed Effect' for full points.",
          },
        ];

    const normalized: StudyStudioData = {
      ...parsed,
      topic: parsed.topic || "Lecture Revision",
      read_time_minutes: parsed.read_time_minutes ?? parsed.readTimeMinutes ?? 5,
      readTimeMinutes: parsed.read_time_minutes ?? parsed.readTimeMinutes ?? 5,
      executive_summary: parsed.executive_summary ?? parsed.executiveSummary ?? "",
      executiveSummary: parsed.executive_summary ?? parsed.executiveSummary ?? "",
      high_yield_takeaways: parsed.high_yield_takeaways ?? parsed.highYieldTakeaways ?? [],
      highYieldTakeaways: parsed.high_yield_takeaways ?? parsed.highYieldTakeaways ?? [],
      key_formulas_or_definitions: parsed.key_formulas_or_definitions ?? parsed.keyFormulasOrDefinitions ?? [],
      keyFormulasOrDefinitions: parsed.key_formulas_or_definitions ?? parsed.keyFormulasOrDefinitions ?? [],
      practice_quiz: questions,
      practiceQuiz: questions,
      traps_and_gotchas: traps,
      trapsAndGotchas: traps,
    };

    return NextResponse.json(normalized);
  } catch (error: unknown) {
    console.error("Internal handler error in /api/generate:", error);
    return NextResponse.json(
      { error: "Failed to generate study materials. Please try again." },
      { status: 500 }
    );
  }
}