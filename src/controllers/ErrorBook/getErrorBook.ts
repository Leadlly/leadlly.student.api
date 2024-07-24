import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';

export const getErrorBook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const errorBook = await SolvedQuestions.aggregate([
			{
				$match: {
					student: req.user._id,
					isCorrect: false,
				},
			},
			{ $unwind: '$question.chapter' },
			{
				$group: {
					_id: '$question.chapter',
					totalQuestions: { $count: {} },
				},
			},
			{
				$project: {
					_id: 0,
					chapter: '$_id',
					totalQuestions: 1,
				},
			},
		]);

		if (!errorBook || errorBook.length < 1) {
			return res.status(404).json({
				success: false,
				message: 'No ErrorBook data found for this user',
			});
		}
		return res.status(200).json({
			success: true,
			errorBook,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
