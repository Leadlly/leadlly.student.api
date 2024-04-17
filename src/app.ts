import express, { urlencoded } from "express";
import { config } from "dotenv";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import userRoutes from "./routes/user";

config({
  path: "./.env",
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors());

//User routes
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { app, handler };
