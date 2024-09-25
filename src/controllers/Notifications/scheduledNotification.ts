import cron from "node-cron";
import { Push_Token } from "../../models/push_token";
import { sendPushNotification } from "../../utils/sendPushNotification";
import User from "../../models/userModel";

// Define the daily messages as functions to include the username
const dailyMessages = {
  "9AM": (username: string) => `Good Morning ${username}! View your today's planner!`,
  "5PM": (username: string) => `Hi ${username}, it's time to start revision. Check out the planner!`,
  "10PM": (username: string) => `Hi ${username}, time to log your today's topics studied in coaching/school.`,
  "11PM": (username: string) => `Time is running out, ${username}! Log today's topics before 12 to optimize your planner.`
};

// Function to get user names and send notifications individually
const sendScheduledNotification = async (messageFunc: (username: string) => string) => {
  try {
    // Fetch all push tokens with their user IDs
    const tokens = await Push_Token.find().populate('user');
    if (tokens.length === 0) {
      console.log("No push tokens found.");
      return;
    }

    // Iterate over each token and send personalized notifications
    for (const tokenData of tokens) {
      const user = await User.findById(tokenData.user); 

      if (user) {
        const message = messageFunc(user.firstname || "Buddy"); 
        await sendPushNotification([tokenData.push_token], message); 
        console.log(`Scheduled notification sent to ${user.firstname}: ${message}`);
      } else {
        console.log(`User not found for token: ${tokenData.push_token}`);
      }
    }
  } catch (error) {
    console.error("Error sending scheduled notification:", error);
  }
};

// Schedule notification at 9 AM
cron.schedule("0 9 * * *", async () => {
  await sendScheduledNotification(dailyMessages["9AM"]);
});

// Schedule notification at 5 PM
cron.schedule("0 17 * * *", async () => {
  await sendScheduledNotification(dailyMessages["5PM"]);
});

// Schedule notification at 10 PM
cron.schedule("0 22 * * *", async () => {
  await sendScheduledNotification(dailyMessages["10PM"]);
});

// Schedule notification at 11 PM
cron.schedule("0 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11PM"]);
});
