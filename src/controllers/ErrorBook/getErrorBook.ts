import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';
import ErrorNotes from '../../models/ErrorNotesModel';

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
					_id: {
						chapter: '$question.chapter',
						subject: '$question.subject',
					},
					totalQuestions: { $count: {} },
				},
			},
			{ $sort: { totalQuestions: -1 } },
			{
				$group: {
					_id: {
						subject: '$_id.subject',
					},
					chapters: {
						$push: {
							chapter: '$_id.chapter',
							totalQuestions: '$totalQuestions',
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					subject: '$_id.subject',
					chapters: 1,
				},
			},
			{ $sort: { subject: 1 } },
		]);

		const errorNotes = await ErrorNotes.find({
			student: req.user._id,
		}).sort({ createdAt: -1 });

		if ((!errorNotes || errorNotes.length < 1) && (!errorBook || errorBook.length < 1)) {
			return res.status(404).json({
				success: false,
				message: 'No Uncompleted Error Notes or ErrorBook data found for this user',
			});
		}

		if (!errorNotes || errorNotes.length < 1) {
			return res.status(200).json({
				success: true,
				message: 'No Uncompleted Error Notes data found for this user',
				errorBook,
			});
		}

		if (!errorBook || errorBook.length < 1) {
			return res.status(200).json({
				success: true,
				message: 'No ErrorBook data found for this user',
				errorNotes,
			});
		}

		return res.status(200).json({
			success: true,
			errorBook,
			errorNotes,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
