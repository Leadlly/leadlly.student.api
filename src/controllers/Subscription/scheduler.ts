import cron from "node-cron";
import moment from "moment";
import User from "../../models/userModel";

// Job runs at midnight every day
cron.schedule("15 0 * * *", async () => {
  try {
    // Deactivate free trials older than 21 days
    const usersWithFreeTrials = await User.find({
      "freeTrial.active": true,
      "freeTrial.dateOfDeactivation": { $lte: moment().toDate() },
      "subscription.status": { $ne: "active" }
    });

    const freeTrialUpdatePromises = usersWithFreeTrials.map((user) => {
      user.freeTrial.active = false;
      user.freeTrial.dateOfActivation = undefined;
      user.freeTrial.dateOfDeactivation = undefined
      user.category = null
      user.updatedAt = new Date()
      return user.save();
    });

    await Promise.all(freeTrialUpdatePromises);
    console.log(`Deactivated free trial for ${usersWithFreeTrials.length} users`);

    // Deactivate subscriptions that have reached their end date
    const now = new Date();
    const usersWithActiveSubscriptions = await User.find({
      "subscription.status": "active",
      "subscription.dateOfDeactivation": { $lte: now },
    });

    const subscriptionUpdatePromises = usersWithActiveSubscriptions.map((user) => {
      user.subscription.status = "inactive";
      user.subscription.dateOfDeactivation = undefined;
      user.subscription.dateOfActivation = undefined;
      user.subscription.id = "";
      user.subscription.planId = "";
      user.subscription.duration = 0; 
      user.category = null;
      user.updatedAt = new Date()
      return user.save();
    });

    await Promise.all(subscriptionUpdatePromises);
    console.log(`Deactivated subscription for ${usersWithActiveSubscriptions.length} users`);
    
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
