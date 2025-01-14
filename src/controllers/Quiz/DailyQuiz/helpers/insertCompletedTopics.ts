import moment from "moment-timezone";
import { IPlanner } from "../../../../types/IPlanner";
import Planner from "../../../../models/plannerModel";

type Data = {
    name: string
    _id: string
}


export const insertCompletedTopics = async(userId: string, data: Data, questions: any[]) => {
    // Saving completed topic in planner
    const timezone = 'Asia/Kolkata';
    const today = moment.tz(timezone).startOf('day').format('YYYY-MM-DD');

    const startDate = moment().startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();

    const planner = await Planner.findOne({
        student: userId,
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
    }) as IPlanner;

    if (!planner) {
        throw new Error('Planner not found');
    }

    const todayPlannerDay = planner.days.find(day => 
        moment(day.date).tz(timezone).format('YYYY-MM-DD') === today
    );

    if (!todayPlannerDay) {
        throw new Error('No planner data found for today');
    }

    // Find the topic in the planner's questions
    const plannerTopicQuestions = todayPlannerDay.questions[data.name] || [];

    if (plannerTopicQuestions.length === questions.length) {

        // If lengths match, check if data._id is in incompletedTopics and remove it
        if (todayPlannerDay.incompletedTopics.includes(data._id)) {
            todayPlannerDay.incompletedTopics = todayPlannerDay.incompletedTopics.filter(id => id !== data._id);
        }
        // If lengths match, push topic into completedTopics array
        if (!todayPlannerDay.completedTopics.includes(data._id)) {
            todayPlannerDay.completedTopics.push(data._id);
        }
    } else {
        // If lengths do not match, push topic into incompletedTopics array
        if (!todayPlannerDay.incompletedTopics.includes(data._id)) {
            todayPlannerDay.incompletedTopics.push(data._id);
        }
    }

    await planner.save();
}
