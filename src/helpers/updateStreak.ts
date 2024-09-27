import IUser from "../types/IUser";

export const updateStreak = async (user: IUser) => {
  try {
    console.log("Checking streak update...");

    // Initialize streak if it doesn't exist
    if (!user?.details?.streak?.updatedAt) {
      user.details.streak = {
        number: 1,
        updatedAt: new Date(), 
      };
      await user.save();
      console.log("Streak initialized:", user.details.streak);
      return;
    }

    const currentDate = new Date().setHours(0, 0, 0, 0); 
    const streakUpdatedAt = new Date(user.details.streak.updatedAt).setHours(0, 0, 0, 0); 

    // Calculate the difference in days between currentDate and streakUpdatedAt
    const differenceInTime = currentDate - streakUpdatedAt;
    const differenceInDays = differenceInTime / (1000 * 3600 * 24); 

    if (differenceInDays === 1) {
      // If it's exactly one day later, continue the streak
      user.details.streak.number += 1;
      user.details.streak.updatedAt = new Date(); 
      await user.save();
      console.log("Streak updated:", user.details.streak);
    } else if (differenceInDays > 1) {
      // If more than one day has passed, reset the streak
      user.details.streak.number = 0; 
      user.details.streak.updatedAt = new Date(); 
      await user.save();
      console.log("Streak reset due to inactivity:", user.details.streak);
    } else {
      console.log("Streak not updated; already updated today.");
    }
  } catch (error: any) {
    console.error("Error updating streak:", error.message);
    throw new Error("Failed to update user streak.");
  }
};