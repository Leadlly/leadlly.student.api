import { StudyData } from "../../../models/studentData";
import Tracker from "../../../models/trackerModel";
import IDataSchema from "../../../types/IDataSchema";
import { calculateChapterMetrics } from '../../CalculateMetrices/calculateChapterMetrics';
import createStudentTracker from "../CreateTracker";
import IUser from "../../../types/IUser";
import { CustomError } from "../../../middlewares/error";

const updateStudentTracker = async (topic: string, user: IUser) => {
  try {

    const fullDocument = await StudyData.findOne({ user: user._id, "topic.name": topic }) as IDataSchema;
    if (!fullDocument) {
      throw new CustomError(`No study data found for the topic '${topic}' for user ${user._id}`, 404);
    }


    const subjectName = fullDocument.subject.name.trim().toLowerCase();
    const chapterName = fullDocument.chapter.name.trim().toLowerCase();
    const topicName = fullDocument.topic.name.trim().toLowerCase();

    let tracker = await Tracker.findOne({
      user: fullDocument.user,
      "subject.name": subjectName,
      'chapter.name': chapterName
    });

    if (!tracker) {
      console.log('Tracker not found, creating a new tracker');
      await createStudentTracker(fullDocument); 
      return;
    }

    const chapterProgress = await calculateChapterMetrics(chapterName, fullDocument.user);

    const topicIndex = tracker.topics.findIndex(topic => topic.name === topicName);

    if (topicIndex !== -1) {
      tracker.topics[topicIndex].plannerFrequency = fullDocument.topic.plannerFrequency;
      tracker.topics[topicIndex].overall_efficiency = fullDocument.topic.overall_efficiency;
      tracker.topics[topicIndex].studiedAt = fullDocument.topic.studiedAt;
      tracker.updatedAt = new Date();

      await Tracker.updateOne(
        { _id: tracker._id, "topics.name": topicName },
        {
          $set: {
            "topics.$": tracker.topics[topicIndex],
            updatedAt: new Date()
          }
        }
      );
      console.log('Topic already present in the tracker, updated the topic information', tracker.topics[topicIndex]);
    } else {
      // Topic does not exist, add it to the tracker
      tracker.topics.push(fullDocument.topic);
      console.log('New topic added to existing tracker');
    }

    tracker.chapter.overall_efficiency = chapterProgress.overall_efficiency;
    tracker.chapter.overall_progress = chapterProgress.overall_progress;
    tracker.chapter.total_questions_solved = chapterProgress.total_questions_solved;
    tracker.updatedAt = new Date();

    await tracker.save();

  } catch (error) {
    console.log(error);
  }
};

export default updateStudentTracker;
