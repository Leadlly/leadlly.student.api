import IUser from "../../../types/IUser";

export const updateStreak = async (user: IUser) => {
  try {
    console.log("Checking streak update...");

    // Initialize streak if it doesn't exist
    if (!user?.details?.streak?.updatedAt) {
      user.details.streak = {
        number: 1, // Start the streak at 1 if it's newly created
        updatedAt: new Date() // Set the current date as the updatedAt
      };
      await user.save();
      console.log("Streak initialized:", user.details.streak);
      return; 
    }

    const currentDate = new Date().setHours(0, 0, 0, 0); 
    const streakUpdatedAt = new Date(user.details.streak.updatedAt).setHours(0, 0, 0, 0); 

    if (streakUpdatedAt < currentDate) {
      user.details.streak.number += 1;
      user.details.streak.updatedAt = new Date(); 
      await user.save(); 
      console.log("Streak updated:", user.details.streak);
    } else {
      console.log("Streak not updated; already updated today.");
    }
  } catch (error: any) {
    console.error("Error updating streak:", error.message);
    throw new Error("Failed to update user streak.");
  }
};
