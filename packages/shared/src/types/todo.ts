export type TodoScore = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TodoData {
  id: string;
  title: string;
  isCompleted: boolean;
  targetDuration: number | null;
  score: TodoScore | null;
  gardenId: string;
  userId: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}
