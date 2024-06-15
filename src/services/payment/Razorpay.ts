import Razorpay from "razorpay";
import { config } from "dotenv";
config();

const key_id = process.env.RAZORPAY_API_KEY as string;
const key_secret = process.env.RAZORPAY_API_SECRET as string;

// if (!key_id || !key_secret) {
//   throw new Error("Razorpay API key or secret is missing");
// }

const razorpay = new Razorpay({
  key_id: key_id,
  key_secret: key_secret,
});

export default razorpay;
