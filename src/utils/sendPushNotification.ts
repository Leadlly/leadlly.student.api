import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (pushTokens: string[], message: string) => {
  // Filter valid push tokens
  const validPushTokens = pushTokens.filter(pushToken => Expo.isExpoPushToken(pushToken));

  if (validPushTokens.length === 0) {
    throw new Error("No valid Expo push tokens.");
  }

  const messages: ExpoPushMessage[] = validPushTokens.map(pushToken => ({
    to: pushToken,
    sound: "default",
    body: message,
    data: { withSome: "data" },  
  }));

  // Chunk the messages into batches
  const chunks = expo.chunkPushNotifications(messages);

  const tickets: ExpoPushTicket[] = [];

  try {
    for (const chunk of chunks) {
      console.log("Sending chunk of messages:", chunk);
      
      // Send each chunk
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Ticket chunk received:", ticketChunk);
      
      tickets.push(...ticketChunk);  
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }

  return tickets;
};
