import express, { urlencoded } from "express";
import { config } from "dotenv";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import authRoutes from "./routes/auth";
import googleRoutes from "./routes/googleAuth";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import courseRoutes from "./routes/courseRoutes"
import userRoutes from "./routes/user"
import questionRoutes from "./routes/question"


config({
  path: "./.env",
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  // origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  //   const allowedOrigins = [
  //     process.env.FRONTEND_URL,
  //     "http://localhost:3000",
  //     "https://accounts.google.com" 
  //   ];
  //   const vercelRegex = /^https?:\/\/(.*\.)?vercel\.app$/;

  //   if (allowedOrigins.includes(origin!) || (origin && vercelRegex.test(origin))) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  origin: "*"
};

app.use(cors(corsOptions));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/user", userRoutes);
app.use("/api", questionRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { app, handler };
