import express, { urlencoded } from "express";
import { config } from "dotenv";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorMiddleware from "./middlewares/error";
import userRoutes from "./routes/user";
import googleRoutes from "./routes/googleAuth";
import paymentRoutes from "./routes/paymentRoutes";
import { Server } from "socket.io";
import { createServer } from "http";

config({
  path: "./.env",
});

const app = express();
const server = createServer(app)
const io = new Server(server)

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cors());

//User routes
app.use("/api/user", userRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/subscribe", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

io.on('connection', (socket) =>{
  console.log("a user is connected")
})

app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { server, handler };
