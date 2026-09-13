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
