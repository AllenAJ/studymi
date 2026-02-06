export type InputType = 'text' | 'audio' | 'pdf' | 'youtube';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface MindMapNode {
  id: string;
  name: string;
  children?: MindMapNode[];
}

export interface StudySet {
  id: string;
  title: string;
  summary: string; // The "Simple Explanation"
  detailedNotes?: string; // HTML formatted detailed notes
  keyConcepts: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  mindMap: MindMapNode;
  createdAt: number;
  type?: InputType;
  /** Set when generated via server API; used to send user feedback to Opik */
  opikTraceId?: string;
}

export interface TeachBackFeedback {
  score: number;
  feedback: string;
  missingConcepts: string[];
  correction: string;
  /** Set when graded via server API; used to send user feedback to Opik */
  traceId?: string;
}