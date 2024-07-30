import { string, z } from 'zod';


export const CreateErrorNoteSchema = z.object({
	note: z.string().trim().min(1),
});

