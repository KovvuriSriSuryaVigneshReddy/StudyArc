import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";
import ActionDeck, { generateAnkiCsv } from "@/components/ActionDeck";
import MathRenderer from "@/components/MathRenderer";
import { StudyStudioData } from "@/types";

describe("Header Component", () => {
  it("renders the StudyArc.ai branding and developer attribution", () => {
    const handleOpenModal = vi.fn();
    render(<Header onOpenKeyModal={handleOpenModal} />);

    // Brand Name
    const brandElement = screen.getByText("StudyArc.ai");
    expect(brandElement).toBeInTheDocument();

    // Developer Credit
    const creditElement = screen.getByText(/Developed by SriSuryaVigneshReddy/i);
    expect(creditElement).toBeInTheDocument();

    // Studio Tag
    const studioBadge = screen.getByText("STUDIO");
    expect(studioBadge).toBeInTheDocument();
  });

  it("triggers onOpenKeyModal when clicking configure key button", () => {
    const handleOpenModal = vi.fn();
    render(<Header onOpenKeyModal={handleOpenModal} hasCustomKey={false} />);

    const keyButton = screen.getByText(/Configure Gemini Key/i);
    fireEvent.click(keyButton);

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it("displays active key status when custom key is present", () => {
    render(<Header onOpenKeyModal={vi.fn()} hasCustomKey={true} />);
    expect(screen.getByText(/Gemini Key Active/i)).toBeInTheDocument();
  });
});

describe("ActionDeck Component & Anki CSV Export", () => {
  const sampleData: StudyStudioData = {
    topic: "Calculus & Linear Algebra",
    read_time_minutes: 6,
    readTimeMinutes: 6,
    executive_summary: "Core review of derivatives and vector spaces.",
    executiveSummary: "Core review of derivatives and vector spaces.",
    high_yield_takeaways: [
      "Derivatives give instantaneous rate of change.",
      "Eigenvectors maintain direction under linear transformations."
    ],
    highYieldTakeaways: [
      "Derivatives give instantaneous rate of change.",
      "Eigenvectors maintain direction under linear transformations."
    ],
    key_formulas_or_definitions: [
      {
        term: "Derivative Definition",
        definition: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      },
      {
        term: "Eigenvalue Equation",
        definition: "Av = \\lambda v",
      },
    ],
    keyFormulasOrDefinitions: [
      {
        term: "Derivative Definition",
        definition: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      },
      {
        term: "Eigenvalue Equation",
        definition: "Av = \\lambda v",
      },
    ],
    traps_and_gotchas: [
      {
        concept: "Chain Rule Neglect",
        commonTrap: "Forgetting the inner derivative when differentiating composite functions.",
        proTip: "Identify inner and outer functions clearly before computing derivatives.",
      },
    ],
    trapsAndGotchas: [
      {
        concept: "Chain Rule Neglect",
        commonTrap: "Forgetting the inner derivative when differentiating composite functions.",
        proTip: "Identify inner and outer functions clearly before computing derivatives.",
      },
    ],
    practice_quiz: [
      {
        id: 1,
        question: "What is the derivative of sin(x)?",
        options: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"],
        correct_index: 0,
        correctIndex: 0,
        explanation: "The rate of change of the sine function is the cosine function.",
      },
    ],
    practiceQuiz: [
      {
        id: 1,
        question: "What is the derivative of sin(x)?",
        options: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"],
        correct_index: 0,
        correctIndex: 0,
        explanation: "The rate of change of the sine function is the cosine function.",
      },
    ],
  };

  it("generates correctly formatted Anki CSV payload", () => {
    const csv = generateAnkiCsv(sampleData);

    // Verify Anki metadata headers
    expect(csv).toContain("#separator:Tab");
    expect(csv).toContain("#html:true");
    expect(csv).toContain("#tags:StudyArc Anki Deck");

    // Verify key terms formatting with tab separation
    expect(csv).toContain("Derivative Definition\tf'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}");
    expect(csv).toContain("Eigenvalue Equation\tAv = \\lambda v");

    // Verify takeaways formatting
    expect(csv).toContain("Takeaway #1\tDerivatives give instantaneous rate of change.");

    // Verify exam trap formatting
    expect(csv).toContain("⚠️ Exam Trap: Chain Rule Neglect");
    expect(csv).toContain("🚨 <b>Common Distractor:</b> Forgetting the inner derivative");

    // Verify quiz question formatting
    expect(csv).toContain("<b>Exam Question:</b> What is the derivative of sin(x)?");
    expect(csv).toContain("<b>Correct Answer:</b> cos(x)");
  });

  it("renders export buttons and triggers Anki export action callback", () => {
    const mockExportAnki = vi.fn();
    render(<ActionDeck data={sampleData} onExportAnki={mockExportAnki} />);

    const ankiButton = screen.getByText(/Export to Anki \(CSV\)/i);
    expect(ankiButton).toBeInTheDocument();

    fireEvent.click(ankiButton);
    expect(mockExportAnki).toHaveBeenCalledTimes(1);

    // Shows visual confirmation
    expect(screen.getByText(/Exported!/i)).toBeInTheDocument();
  });
});

describe("MathRenderer Component", () => {
  it("renders inline math expressions with KaTeX without crashing", () => {
    const { container } = render(
      <MathRenderer text="The famous Einstein equation is $E = mc^2$ in physics." />
    );

    expect(container).toBeInTheDocument();
    // KaTeX wraps parsed math in .katex elements
    const katexEl = container.querySelector(".katex");
    expect(katexEl).toBeInTheDocument();
    expect(screen.getByText(/The famous Einstein equation is/i)).toBeInTheDocument();
  });

  it("renders standalone block math equations successfully", () => {
    const { container } = render(
      <MathRenderer text="Integration formula: $$\int_a^b f(x)dx = F(b) - F(a)$$" />
    );

    expect(container).toBeInTheDocument();
    const katexEl = container.querySelector(".katex");
    expect(katexEl).toBeInTheDocument();
  });

  it("handles raw LaTeX syntax like superscripts and greek symbols", () => {
    const { container } = render(
      <MathRenderer text="Sigmoid activation is \sigma and weight matrix is W^{[l]}" />
    );

    expect(container).toBeInTheDocument();
    const katexEls = container.querySelectorAll(".katex");
    expect(katexEls.length).toBeGreaterThan(0);
  });

  it("gracefully renders fallback text for malformed LaTeX without crashing", () => {
    // Deliberately malformed LaTeX string
    const { container } = render(
      <MathRenderer text="Malformed equation $\frac{broken" />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Malformed equation/i)).toBeInTheDocument();
  });

  it("returns null or empty for null or empty input", () => {
    const { container } = render(<MathRenderer text="" />);
    expect(container.firstChild).toBeNull();
  });
});
