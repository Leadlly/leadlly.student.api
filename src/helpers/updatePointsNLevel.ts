import { CustomError } from "../middlewares/error";
import User from "../models/userModel";

export const updatePointsNLevel = async (userId: string, questions?: any, quizEfficiency?: number) => {
  try {

    let efficiency;
    const user = await User.findById(userId);
    if (!user) throw new CustomError("User not exists", 404);

    if (quizEfficiency) {
      efficiency = quizEfficiency
    } else if (questions) {
      const correctQuestions = questions.filter((question: any) => question.isCorrect).length

      efficiency = ( correctQuestions * 100 ) / questions.length
    } else {
      efficiency = user.details.report?.dailyReport?.overall;
    }
    

    if(!efficiency) throw new CustomError("Efficiency not undefined")

    if (!user?.details?.points) {
      user.details.points = {
        number: 0,
      };
      console.log("Points initialized:", user.details.streak);
    };

    if (!user?.details?.level) {
      user.details.level = {
        number: 1,
      };
      console.log("Points initialized:", user.details.streak);
    };


    let points = user.details.points.number;
    let oldPoints = points; 
    let newPoints = points;

    // Increase points based on efficiency
    if (efficiency > 90) {
      newPoints += 3;
    } else if (efficiency >= 70) {
      newPoints += 2;
    } else if (efficiency >= 50) {
      newPoints += 1;
    }

    user.details.points.number = newPoints;

    // Level-up logic based on the point difference
    const initialThreshold = 150;
    const calculateNextThreshold = (currentThreshold: number) => currentThreshold + (currentThreshold * 0.5);

    let currentThreshold = initialThreshold;
    let levelIncreased = false;

    let totalGainedPoints = newPoints - oldPoints;

    // Level-up based on the total gained points, without resetting points
    while (totalGainedPoints >= currentThreshold) {
      user.details.level.number += 1; 
      totalGainedPoints -= currentThreshold;
      newPoints += 10;
      currentThreshold = calculateNextThreshold(currentThreshold); 
      levelIncreased = true;
    }

    if (levelIncreased) {
      user.details.points.number = newPoints; // Update points after level-up
    }

    user.updatedAt = new Date()
    await user.save();
    console.log(`level ${user.details.level.number} and points ${user.details.points.number} updated`)

  } catch (error) {
    throw new Error("Failed to update user points.");
  }
};
