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
import { generateWeeklyPlanner } from "./controllers/Planner/Generate/generatePlanner";

// generateWeeklyPlanner("666a01a69461d46dc3c7b5fb")
config({
  path: "./.env",
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
      origin: (origin, callback) => {
          console.log('Request from origin:', origin);
          if (origin === undefined || origin === null) {
               callback(null, true);
          } else if (
              origin.match(/^https?:\/\/(.*\.)?vercel\.app$/) ||
              origin === process.env.FRONTEND_URL
          ) {
              callback(null, true);
          } else {
              console.log('Not allowed by CORS:', origin);
              callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { app, handler };
