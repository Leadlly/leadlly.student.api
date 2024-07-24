import { string, z } from 'zod';

export const ChapterErrorBookSchema = z.object({
	chapterName: z.string().trim(),
});

export const CreateErrorNoteSchema = z.object({
	note: z.string().trim().min(1),
});

