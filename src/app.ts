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
import serverless from "serverless-http";


config({
  path: "./.env",
});

const app = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli(),
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/questionbank", questionRoutes);

app.get("/api", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

export const handler = serverless(app);
export { app };
