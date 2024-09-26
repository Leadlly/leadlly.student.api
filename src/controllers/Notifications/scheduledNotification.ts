import cron from "node-cron";
import { Push_Token } from "../../models/push_token";
import { sendPushNotification } from "../../utils/sendPushNotification";

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
// Schedule notification at 11:45 PM
cron.schedule("45 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
// Schedule notification at 11:45 PM
cron.schedule("45 23 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});

//tests
cron.schedule("0 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
cron.schedule("2 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
cron.schedule("5 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
cron.schedule("7 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
cron.schedule("9 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});
cron.schedule("11 19 * * *", async () => {
  await sendScheduledNotification(dailyMessages["11:45PM"]);
});

// Function to send scheduled notifications with chunking
const sendScheduledNotification = async (message: string) => {
  try {
    const tokens = await Push_Token.find();
    const pushTokens = tokens.map(tokenData => tokenData.push_token);

    if (pushTokens.length === 0) {
      console.log("No push tokens found.");
      return;
    }

    // Send the notifications in chunks
    await sendPushNotification(pushTokens, message);

    console.log(`Scheduled notification sent: ${message}`);
  } catch (error) {
    console.error("Error sending scheduled notification:", error);
  }
};
