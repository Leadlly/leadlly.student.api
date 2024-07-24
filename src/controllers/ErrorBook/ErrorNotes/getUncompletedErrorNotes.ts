import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../middlewares/error';
import ErrorNotes from '../../../models/ErrorNotesModel';

export const getUnCompletedErrorNotes = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const unCompletedErrorNotes = await ErrorNotes.find({
			student: req.user._id,
			isCompleted: false,
		});
		if (!unCompletedErrorNotes || unCompletedErrorNotes.length < 1) {
			return res.status(404).json({
				success: false,
				message: 'No Uncompleted Error Notes data found for this user',
			});
		}
		return res.status(200).json({
			success: true,
			unCompletedErrorNotes,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
