import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';
import { ChapterErrorBookSchema } from '../../Schemas/errorBook.schema';

export const getChapterErrorBook = async (req: Request, res: Response, next: NextFunction) => {
	const { success } = ChapterErrorBookSchema.safeParse(req.body);
	if (!success) {
		return next(new CustomError('Invalid request body'));
	}
	const { chapterName } = req.body;

	try {
		const chapterErrorBook = await SolvedQuestions.aggregate([
			{
				$match: {
					student: req.user._id,
					isCorrect: false,
					'question.chapter': chapterName,
				},
			},
			{
				$project: {
					question: 1,
				},
			},
		]);

		if (!chapterErrorBook || chapterErrorBook.length < 1) {
			return res.status(404).json({
				success: false,
				message: 'No chapter ErrorBook data found for this user',
			});
		}
		return res.status(200).json({
			success: true,
			chapterErrorBook,
		});
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
