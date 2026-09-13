export type SubjectMode = "stem" | "humanities";
export type DifficultyLevel = "quick_cram" | "deep_mastery";

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  correctIndex?: number;
  explanation: string;
}

export interface ExamTrap {
  concept: string;
  commonTrap: string;
  common_trap?: string;
  proTip: string;
  pro_tip?: string;
}

export interface StudyStudioData {
  topic: string;
  read_time_minutes: number;
  readTimeMinutes?: number;
  executive_summary: string;
  executiveSummary?: string;
  high_yield_takeaways: string[];
  highYieldTakeaways?: string[];
  key_formulas_or_definitions: KeyConcept[];
  keyFormulasOrDefinitions?: KeyConcept[];
  practice_quiz: QuizQuestion[];
  practiceQuiz?: QuizQuestion[];
  traps_and_gotchas?: ExamTrap[];
  trapsAndGotchas?: ExamTrap[];
}

export interface GenerateStudyRequest {
  content: string;
  subjectMode: SubjectMode;
  difficultyLevel: DifficultyLevel;
  customApiKey?: string;
  isMock?: boolean;
}

export interface UserQuizState {
  answers: Record<number, number>; // question id -> chosen option index
  submitted: Record<number, boolean>;
  isCompleted: boolean;
}

/**
 * Raw quiz question structure emitted by the Gemini model
 */
export interface GeminiQuizQuestion {
  id?: number;
  question?: string;
  options?: string[];
  correct_index?: number;
  correctIndex?: number;
  explanation?: string;
}

/**
 * Raw trap & distractor item emitted by the Gemini model
 */
export interface GeminiExamTrap {
  concept?: string;
  commonTrap?: string;
  common_trap?: string;
  proTip?: string;
  pro_tip?: string;
}

/**
 * Raw JSON payload emitted by the Gemini model
 */
export interface GeminiGeneratedPayload {
  topic?: string;
  readTimeMinutes?: number;
  read_time_minutes?: number;
  executiveSummary?: string;
  executive_summary?: string;
  highYieldTakeaways?: string[];
  high_yield_takeaways?: string[];
  keyFormulasOrDefinitions?: KeyConcept[];
  key_formulas_or_definitions?: KeyConcept[];
  trapsAndGotchas?: GeminiExamTrap[];
  traps_and_gotchas?: GeminiExamTrap[];
  practiceQuiz?: GeminiQuizQuestion[];
  practice_quiz?: GeminiQuizQuestion[];
}

/**
 * Gemini Google API candidate and content response
 */
export interface GeminiCandidatePart {
  text?: string;
}

export interface GeminiCandidateContent {
  parts?: GeminiCandidatePart[];
  role?: string;
}

export interface GeminiCandidate {
  content?: GeminiCandidateContent;
  finishReason?: string;
}

export interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Type-safe Speech Recognition declarations for Web Speech API
 */
export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
