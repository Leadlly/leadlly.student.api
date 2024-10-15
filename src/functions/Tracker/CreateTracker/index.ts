import mongoose from 'mongoose';
import Tracker from "../../../models/trackerModel";
import IDataSchema from "../../../types/IDataSchema";
import User from '../../../models/userModel';
import { calculateChapterMetrics } from '../../CalculateMetrices/calculateChapterMetrics';
import updateStudentTracker from '../UpdateTracker';

const createStudentTracker = async (fullDocument: IDataSchema) => {
  console.log("worker executed");

  try {
    const user = await User.findById(fullDocument.user);
    if (!user) throw new Error('User not found');

    const subjectName = fullDocument.subject.name.trim().toLowerCase();
    const chapterName = fullDocument.chapter.name.trim().toLowerCase();
    const topicName = fullDocument.topic.name.trim().toLowerCase();

    // Calculate chapter metrics
    const chapterProgress = await calculateChapterMetrics(chapterName, fullDocument.user);

    let tracker = await Tracker.findOne({
      user: fullDocument.user,
      "subject.name": subjectName,
      'chapter.name': chapterName
    });

    if (tracker) {
        await updateStudentTracker(topicName, user)
        return 
    } else {
      // Tracker does not exist, create a new tracker with chapter progress and efficiency
      tracker = new Tracker({
        user: fullDocument.user,
        subject: { name: subjectName },
        chapter: {
          id: fullDocument.chapter.id,
          name: chapterName,
          overall_efficiency: chapterProgress.overall_efficiency,
          overall_progress: chapterProgress.overall_progress,
          total_questions_solved: chapterProgress.total_questions_solved
        },
        topics: [fullDocument.topic]
      });
      console.log('New tracker created');
    }

    // Update tracker with additional details from fullDocument
    const topicIndex = tracker.topics.findIndex(topic => topic.name === topicName);

    if (topicIndex !== -1) {
      tracker.topics[topicIndex].plannerFrequency = fullDocument.topic.plannerFrequency;
      tracker.topics[topicIndex].overall_efficiency = fullDocument.topic.overall_efficiency;
      tracker.topics[topicIndex].studiedAt = fullDocument.topic.studiedAt;
    }

    tracker.updatedAt = new Date();

    // Save the updated tracker
    await tracker.save();

  } catch (error) {
    console.log(error);
  }
};

export default createStudentTracker;
