export interface VerdictResponse {
  winner: "A" | "B" | "TIE";
  verdict_summary: string;
  side_a_analysis: {
    strengths: string[];
    weaknesses: string[];
  };
  side_b_analysis: {
    strengths: string[];
    weaknesses: string[];
  };
  detailed_reasoning: string;
  scores: {
    side_a: number;
    side_b: number;
  };
}

export interface DebateWithUser {
  id: string;
  topic: string;
  sideAArgument: string;
  sideBArgument: string;
  winner: string;
  verdictSummary: string;
  sideAAnalysis: { strengths: string[]; weaknesses: string[] };
  sideBAnalysis: { strengths: string[]; weaknesses: string[] };
  detailedReasoning: string;
  sideAScore: number;
  sideBScore: number;
  createdAt: Date;
}
