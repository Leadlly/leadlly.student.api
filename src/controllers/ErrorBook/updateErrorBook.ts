import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';
import { UpdateErrorBookSchema } from '../../Schemas/errorBook.schema';

export const updateErrorBook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validation = UpdateErrorBookSchema.safeParse(req.body);

		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: validation.error.errors,
			});
		}

		const { solvedQuestions } = validation.data;
      


		await SolvedQuestions.updateMany({ question: { $in: solvedQuestions }, student: req.user._id }, { $set: { isCorrect: true } });

		const updatedQuestions = await SolvedQuestions.find({
			_id: { $in: solvedQuestions },
		});


		return res.status(200).json({
			success: true,
			updatedQuestions,
		});
	} catch (error: any) {
		if (error instanceof ZodError) {
			return res.status(400).json({
				success: false,
				message: error.errors,
			});
		}

		console.error('Update Error Book Error:', error);
		next(new CustomError(error));
	}
};
