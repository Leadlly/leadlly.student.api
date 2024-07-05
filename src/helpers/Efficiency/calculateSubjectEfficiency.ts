import { ObjectId } from 'mongodb';

import { questions_db } from '../../db/db';
import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
export const calculateSubjectEfficiency = async (subjectName: string, user: IUser) => {
	try {
		const studentData = await StudyData.aggregate([
			{ $match: { user: new ObjectId(user._id), 'subject.name': subjectName } },
			{
				$group: {
					_id: '$chapter.name',
					averageEfficiency: { $avg: '$chapter.overall_efficiency' },
				},
			},
			{
				$project: {
					_id: 0,
					chapterName: '$_id',
					averageEfficiency: 1,
				},
			},
		]).exec();
		const subjectEfficiency =
			studentData.reduce((acc, data) => acc + data.averageEfficiency, 0) / studentData.length;
		console.log(studentData, subjectEfficiency);
	} catch (error) {
		console.error('Error calculating subject efficiency:', error);
		throw new Error('Failed to calculate subject efficiency');
	}
};
