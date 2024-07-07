import Tracker from "../../models/trackerModel"
import User from "../../models/userModel"
import IDataSchema from "../../types/IDataSchema"

const createStudentTracker = async (fullDocument: IDataSchema) => {
    try {
      const user = await User.findById(fullDocument.user);
      if (!user) throw new Error('User not found');
  
      const subject = fullDocument.subject;
      const chapterName = fullDocument.chapter.name;
  
      let tracker = await Tracker.findOne({
        user: fullDocument.user,
        subject: subject,
        'chapter.name': chapterName
      });
  
      if (tracker) {
        // Tracker exists, push the topic to the existing tracker
        tracker.topics.push(fullDocument.topic);
        await tracker.save();
        console.log('Tracker updated with new topic');
      } else {
        // Tracker does not exist, create a new tracker
        tracker = new Tracker({
          user: fullDocument.user,
          subject: subject,
          chapter: fullDocument.chapter,
          topics: [fullDocument.topic]
        });
        await tracker.save();

        console.log(tracker)
        console.log('New tracker created');
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  export default createStudentTracker;