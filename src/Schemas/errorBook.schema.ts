import { string, z } from 'zod';


export const CreateErrorNoteSchema = z.object({
	note: z.string().trim().min(1),
});

export const UpdateErrorBookSchema = z.object({
	solvedQuestions: z.array(z.string()),
});