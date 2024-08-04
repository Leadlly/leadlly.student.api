import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';

export const getChapterErrorBook = async (req: Request, res: Response, next: NextFunction) => {

	const  chapterName  = req.params.chapter;
	console.log(chapterName)

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
		console.log(chapterErrorBook)
	} catch (error: any) {
		console.error(error);
		next(new CustomError(error.message));
	}
};
