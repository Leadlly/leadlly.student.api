export type ChapterProps = {
  chapter: string;
  totalQuestions: number;
};

export type SubjectProps = {
  subject: string;
  chapters: ChapterProps[];
};
export type ErrorNoteProps = {
  _id: string;
  note: string;
  isCompleted: boolean;
  createdAt: Date;
};

export type ErrorBookProps = {
  errorBook?: SubjectProps[];
  errorNotes?: any;
}