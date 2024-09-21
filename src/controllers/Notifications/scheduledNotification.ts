import cron from "node-cron";
import { Push_Token } from "../../models/push_token";
import { sendPushNotification } from "../../utils/sendPushNotification";

// Define messages for different times
const dailyMessages = {
  "9AM": "Good morning! Here's your first update of the day!",
  "5PM": "Good evening! Here's an update for your evening.",
  "11PM": "Don't forget! Here's your nightly reminder.",
  "11:45PM": "Almost midnight! Here’s your final update for the day."
};

// Schedule notification at 9 AM
cron.schedule("0 9 * * *", async () => {
  await sendScheduledNotification(dailyMessages["9AM"]);
});

// Schedule notification at 5 PM
cron.schedule("0 17 * * *", async () => {
  await sendScheduledNotification(dailyMessages["5PM"]);
});

// Schedule notification at 11 PM
cron.schedule("0 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11PM"]);
});

// Schedule notification at 11:45 PM
cron.schedule("45 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});

const sendScheduledNotification = async (message: string) => {
  try {
    const tokens = await Push_Token.find(); 

    if (tokens.length > 0) {
      for (const tokenData of tokens) {
        await sendPushNotification(tokenData.push_token, message);
      }
    } else {
      console.log("No push tokens found.");
    }
  } catch (error) {
    console.error("Error sending scheduled notification:", error);
  }
};
