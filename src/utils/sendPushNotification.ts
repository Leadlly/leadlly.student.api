import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (pushToken: string, message: string) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error(`Invalid Expo push token: ${pushToken}`);
  }

  const messages: ExpoPushMessage[] = [{
    to: pushToken,
    sound: "default",
    body: message,
    data: { withSome: "data" },
  }];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log("Tickets:", ticketChunk);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
