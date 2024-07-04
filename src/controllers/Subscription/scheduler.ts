import cron from "node-cron";
import moment from "moment";
import User from "../../models/userModel";

// Job runs at midnight every day
cron.schedule("0 0 * * *", async () => {
  try {
    const users = await User.find({
      "freeTrial.active": true,
      "freeTrial.dateOfActivation": {
        $lte: moment().subtract(21, "days").toDate(),
      },
    });

    const updatePromises = users.map((user) => {
      user.freeTrial.active = false;
      return user.save();
    });

    await Promise.all(updatePromises);
    console.log(`Deactivated free trial for ${users.length} users`);
  } catch (error) {
    console.error("Error deactivating free trials:", error);
  }
});
