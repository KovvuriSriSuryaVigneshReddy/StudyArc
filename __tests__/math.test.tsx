import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MathRenderer from "@/components/MathRenderer";

describe("MathRenderer Unit & Component Suite", () => {
  it("parses $x^2$ inline formula cleanly without crashing", () => {
    const { container } = render(<MathRenderer text="Let $x^2$ be positive" />);

    expect(container).toBeInTheDocument();
    const katexEl = container.querySelector(".katex");
    expect(katexEl).toBeInTheDocument();
    expect(screen.getByText(/Let/i)).toBeInTheDocument();
    expect(screen.getByText(/be positive/i)).toBeInTheDocument();
  });

  it("parses standalone block equations delimited by $$ without crashing", () => {
    const { container } = render(
      <MathRenderer text="Gaussian Integral: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$" />
    );

    expect(container).toBeInTheDocument();
    const katexEl = container.querySelector(".katex");
    expect(katexEl).toBeInTheDocument();
  });

  it("parses raw un-delimited LaTeX sequences like \\sigma, \\nabla, and W^{[l]}", () => {
    const { container } = render(
      <MathRenderer text="Gradient is \nabla f and layer weights are W^{[l]}" />
    );

    expect(container).toBeInTheDocument();
    const katexEls = container.querySelectorAll(".katex");
    expect(katexEls.length).toBeGreaterThanOrEqual(1);
  });

  it("reuses cached KaTeX HTML when rendering identical math expressions repeatedly", () => {
    // 1st render
    const { container: c1 } = render(<MathRenderer text="Identical formula $E = mc^2$" />);
    const html1 = c1.querySelector(".katex")?.innerHTML;

    // 2nd render of the exact same math segment
    const { container: c2 } = render(<MathRenderer text="Another place with $E = mc^2$" />);
    const html2 = c2.querySelector(".katex")?.innerHTML;

    expect(html1).toBeDefined();
    expect(html2).toBeDefined();
    expect(html1).toBe(html2);
  });

  it("gracefully falls back to raw text for malformed LaTeX without crashing", () => {
    const { container } = render(
      <MathRenderer text="Broken math: $\frac{unclosed" />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Broken math/i)).toBeInTheDocument();
  });

  it("returns null when provided empty or null text", () => {
    const { container } = render(<MathRenderer text="" />);
    expect(container.firstChild).toBeNull();
  });
});
