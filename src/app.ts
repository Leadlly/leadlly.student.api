import express, { urlencoded } from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressWinston from "express-winston";
import winston from "winston";
import errorMiddleware from "./middlewares/error";
import authRoutes from "./routes/auth";
import googleRoutes from "./routes/googleAuth";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import courseRoutes from "./routes/courseRoutes";
import userRoutes from "./routes/user";
import plannerRoutes from "./routes/planner";
import questionRoutes from "./routes/question";
import quizRoutes from "./routes/quiz";
import trackerRoutes from "./routes/tracker";
import meetingRoutes from "./routes/meeting";
import errorBookRoutes from "./routes/errorBook";
import notificationRoutes from "./routes/notificationRoutes"
import batchRoutes from "./routes/batchManagment"
import dataRoutes from "./routes/data"
import apiKeyRoutes from "./routes/apiKeyRoutes"

config({
  path: "./.env",
});

const app = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/questionbank", questionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/errorBook", errorBookRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/key", apiKeyRoutes)

app.get("/api", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

export { app };
