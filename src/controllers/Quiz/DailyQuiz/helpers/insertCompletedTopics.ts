import moment from "moment-timezone";
import { IPlanner } from "../../../../types/IPlanner";
import Planner from "../../../../models/plannerModel";

type Topic = {
    name: string
}

export const insertCompletedTopics = async(userId: string, topic: Topic, questions: any[]) => {
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
    const plannerTopicQuestions = todayPlannerDay.questions[topic.name] || [];

    if (plannerTopicQuestions.length === questions.length) {
        // If lengths match, push topic into completedTopics array
        if (!todayPlannerDay.completedTopics.includes(topic.name)) {
            todayPlannerDay.completedTopics.push(topic.name);
        }
    } else {
        // If lengths do not match, push topic into incompletedTopics array
        if (!todayPlannerDay.incompletedTopics.includes(topic.name)) {
            todayPlannerDay.incompletedTopics.push(topic.name);
        }
    }

    await planner.save();
}
