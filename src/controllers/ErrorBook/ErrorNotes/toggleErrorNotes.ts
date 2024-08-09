import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../../middlewares/error';
import ErrorNotes from '../../../models/ErrorNotesModel';

export const toggleErrorNotes = async (req: Request, res: Response, next: NextFunction) => {
	const errorNoteId = req.params.errorNote;
	try {
		const updatedErrorNotes = await ErrorNotes.findOneAndUpdate(
			{
				_id: errorNoteId,
			},
		[{
			$set: {
				isCompleted: { $not: '$isCompleted' },
			},
		}],
			{ new: true, upsert: false }
		);
		if (!updatedErrorNotes) {
			return res.status(404).json({
				success: false,
				message: 'No Error Notes data found for this user',
			});
		}
		return res.status(200).json({
			success: true,
			updatedErrorNotes,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
