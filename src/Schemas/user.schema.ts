import { z } from "zod";
export enum Mood {
  Sad = "sad",
  Unhappy = "unhappy",
  Neutral = "neutral",
  Smiling = "smiling",
  Laughing = "laughing",
}
export const todaysVibeSchema = z.object({
  todaysVibe: z.nativeEnum(Mood),
});
