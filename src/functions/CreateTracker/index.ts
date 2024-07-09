import mongoose from 'mongoose';
import Tracker from "../../models/trackerModel";
import User from "../../models/userModel";
import IDataSchema from "../../types/IDataSchema";

const createStudentTracker = async (fullDocument: IDataSchema) => {
  console.log("worker executed");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(fullDocument.user).session(session);
    if (!user) throw new Error('User not found');

    const subjectName = fullDocument.subject.name.trim().toLowerCase();
    const chapterName = fullDocument.chapter.name.trim().toLowerCase();

    let tracker = await Tracker.findOne({
      user: fullDocument.user,
      "subject.name": subjectName,
      'chapter.name': chapterName
    }).session(session);

    if (tracker) {
      // Check if the topic already exists in the tracker
      const topicExists = tracker.topics.some(
        (topic) => topic.name === fullDocument.topic.name.trim().toLowerCase()
      );

      if (topicExists) {
        console.log('Topic already exists in tracker, returning without updating');
        await session.commitTransaction();
        session.endSession();
        return; // Topic already exists, return without making changes
      }

      // Topic does not exist, push the new topic into the chapter
      tracker.topics.push(fullDocument.topic);
      await tracker.save({ session });

      console.log('New topic added to existing tracker');
    } else {
      // Tracker does not exist, create a new tracker
      tracker = new Tracker({
        user: fullDocument.user,
        subject: { name: subjectName },
        chapter: { name: chapterName },
        topics: [fullDocument.topic]
      });
      await tracker.save({ session });

      console.log('New tracker created');
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};

export default createStudentTracker;
