import express, { urlencoded } from "express";
import { config } from "dotenv";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import userRoutes from "./routes/user";
import googleRoutes from "./routes/googleAuth";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import courseRoutes from "./routes/courseRoutes"


config({
  path: "./.env",
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// routes
app.use("/api/user", userRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/course", courseRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { app, handler };
