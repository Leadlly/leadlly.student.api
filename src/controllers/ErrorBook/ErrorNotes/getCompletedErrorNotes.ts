import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../middlewares/error';
import ErrorNotes from '../../../models/ErrorNotesModel';

export const getCompletedErrorNotes = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const completedErrorNotes = await ErrorNotes.find({
			student: req.user._id,
			isCompleted: true,
		});
		if (!completedErrorNotes || completedErrorNotes.length < 1) {
			return res.status(404).json({
				success: false,
				message: 'No completed Error Notes data found for this user',
			});
		}
		return res.status(200).json({
			success: true,
			completedErrorNotes,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
