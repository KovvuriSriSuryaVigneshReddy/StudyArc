<div align="center">

# 🌌 StudyArc.ai
### Spatial AI Cognitive Studio for High-Retention Revision

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/LaTeX-KaTeX-377B2B?style=for-the-badge&logo=latex)](https://katex.org/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-FCC72B?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

**Transform dense lecture slides, course packs, and handwritten notes into structured takeaways, 3D interactive flashcards, rendered LaTeX formulas, and active-recall quizzes in seconds.**

[Live Demo](https://studyarc.vercel.app) · [Report Bug](https://github.com/KovvuriSriSuryaVigneshReddy/StudyArc/issues) · [Submit Feature](https://github.com/KovvuriSriSuryaVigneshReddy/StudyArc/pulls)

</div>

---

## ⚡ The Cognitive Gap in AI Study Tools

* **The Problem:** Most AI tools output passive, unstructured walls of text. Students read them, experience an illusion of competence, and struggle during exam recall. Furthermore, traditional summarizers break STEM notation into unreadable text strings like `delta^{[l]}` or `sigma(z)`.
* **The Solution:** **StudyArc.ai** bridges passive ingestion and active recall. Using multimodal processing and structured JSON schema generation via Google Gemini, it parses multi-file course materials into a sensory, high-agency revision dashboard.

---

## 🛸 Core Features

* **Multimodal Lecture Ingestion:** Concurrently process multiple `.pdf`, `.pptx`, `.txt`, `.md`, and handwritten photo files.
* **Mathematical Typography (KaTeX):** Full LaTeX parsing for complex scientific notation ($x^2$, $\delta^{[l]}$, $\sigma(z)$, matrix derivatives).
* **3D Tactile Flashcards:** Interactive $180^\circ$ flippable cards engineered for retrieval practice.
* **Active-Recall Diagnostic Engine:** Conceptual multiple-choice questions complete with instant distractor feedback explaining why incorrect options are misleading.
* **Study Stack Export:**
  * **Anki Deck:** Download formatted, tab-delimited CSVs for direct import into Anki.
  * **Notion Workspace:** 1-click markdown copy featuring toggle-list structures (`> ### Term`).
  * **Print-to-PDF:** Clean monochrome stylesheet optimized for offline revision.
* **Spatial Sci-Fi UI:** Slate `#090d16` canvas with responsive starfields, glassmorphism, and spatial cursor interactions.

---

## 🛠️ Tech Stack Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Actions, React 18) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS, Lucide Icons, Glassmorphic Design System |
| **AI Engine** | Google Gemini API (`gemini-2.0-flash`) with Structured JSON Schemas |
| **Math Engine** | KaTeX (`renderToString` with regex parsing and memoization) |
| **Testing** | Vitest, React Testing Library, JSDOM |
| **Deployment** | Vercel Edge Network |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.17+ 
* npm or pnpm
* Google Gemini API Key ([Get one free from Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository
```bash
git clone [https://github.com/KovvuriSriSuryaVigneshReddy/StudyArc.git](https://github.com/KovvuriSriSuryaVigneshReddy/StudyArc.git)
cd StudyArc
