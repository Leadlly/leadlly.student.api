import { ObjectId } from 'mongodb';

import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
export const calculateChapterEfficiency = async (chapterName: string, user: any) => {
	try {
		const studentData = await StudyData.aggregate([
			{ $match: { user: new ObjectId(user._id), 'chapter.name': chapterName } },
			{
				$group: {
					_id: '$topic.name',
					averageEfficiency: { $avg: '$topic.overall_efficiency' },
				},
			},
			{
				$project: {
					_id: 0,
					topicName: '$_id',
					averageEfficiency: 1,
				},
			},
		]).exec();
		const chapterEfficiency =
			studentData.reduce((acc, data) => acc + data.averageEfficiency, 0) / studentData.length;
		console.log(chapterEfficiency);
		return chapterEfficiency;
	} catch (error) {
		console.error('Error calculating chapter efficiency:', error);
		throw new Error('Failed to calculate chapter efficiency');
	}
};
