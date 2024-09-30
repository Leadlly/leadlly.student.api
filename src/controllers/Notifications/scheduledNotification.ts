import cron from "node-cron";
import { Push_Token } from "../../models/push_token";
import { sendPushNotification } from "../../utils/sendPushNotification";
import User from "../../models/userModel";

// Define the daily messages as functions to include the username and emojis
const dailyMessages = {
  "9AM": (username: string) => ({
    heading: "🌅 Good Morning!",
    message: `Good Morning ${username}! 📝 View your today's planner!`,
    action: "View Planner", 
    url: "#" 
  }),
  "5PM": (username: string) => ({
    heading: "🕔 Time for Revision!",
    message: `Hi ${username}, it's time to start revision. 📚 Check out the planner!`,
    action: "Start Revising", 
    url: "#" 
  }),
  "7PM": (username: string) => ({
    heading: "🕖 Have You Started?",
    message: `Hey ${username}, have you started your revision? Let's keep that momentum going! 🚀`,
    action: "Revise Now",
    url: "#" 
  }),
  "10PM": (username: string) => ({
    heading: "🕙 Log Your Topics!",
    message: `Hi ${username}, time to log your today's topics studied in coaching/school. 🖊️`,
    action: "Log Topics", 
    url: "#" 
  }),
  "11PM": (username: string) => ({
    heading: "⏰ Last Call!",
    message: `Time is running out, ${username}! ⏳ Log today's topics before 12 to optimize your planner.`,
    action: "Log Now", 
    url: "#" 
  }),
};

// Function to get user names and send notifications individually
const sendScheduledNotification = async (messageFunc: (username: string) => { heading: string; message: string; action: string; url: string; }) => {
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
        const { heading, message, action, url } = messageFunc(user.firstname || "Buddy"); 
        // Send the push notification with heading, message, and action
        await sendPushNotification([tokenData.push_token], heading, message, action);
        console.log(`Scheduled notification sent to ${user.firstname}: ${heading} - ${message}`);
      } else {
        console.log(`User not found for token: ${tokenData.push_token}`);
      }
    }
  } catch (error) {
    console.error("Error sending scheduled notification:", error);
  }
};

// Usage example for 7.30 AM notification
cron.schedule("35 7 * * *", async () => {
  await sendScheduledNotification(dailyMessages["9AM"]);
});


// Schedule notification at 9 AM
cron.schedule("0 9 * * *", async () => {
  await sendScheduledNotification(dailyMessages["9AM"]);
});

// Schedule notification at 5 PM
cron.schedule("0 17 * * *", async () => {
  await sendScheduledNotification(dailyMessages["5PM"]);
});

// Schedule notification at 7 PM
cron.schedule("23 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["7PM"]);
});

// Schedule notification at 10 PM
cron.schedule("0 22 * * *", async () => {
  await sendScheduledNotification(dailyMessages["10PM"]);
});

// Schedule notification at 11 PM
cron.schedule("0 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11PM"]);
});
