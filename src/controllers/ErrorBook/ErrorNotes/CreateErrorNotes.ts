import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../middlewares/error';
import { CreateErrorNoteSchema } from '../../../Schemas/errorBook.schema';
import ErrorNotes from '../../../models/ErrorNotesModel';

export const createErrorNote = async (req: Request, res: Response, next: NextFunction) => {
	const { success } = CreateErrorNoteSchema.safeParse(req.body);
	if (!success) {
		return next(new CustomError('Invalid request body'));
	}
	const { note } = req.body;

	try {
		const errorNote = await ErrorNotes.create({
			student: req.user._id,
			note,
		});
		if (!errorNote) {
			return res.status(404).json({
				success: false,
				message: 'failed to create error note for this user',
			});
		}
		return res.status(200).json({
			success: true,
			errorNote,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
