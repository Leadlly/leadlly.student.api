import crypto from "crypto";

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};