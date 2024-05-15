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
import { Server } from "socket.io";
import { createServer } from "http";
import { redis } from "./server";
import { Redis } from "ioredis";

config({
  path: "./.env",
});

const app = express();
const server = createServer(app)
const io = new Server(server)
const redisSubscriber = new Redis();
const redisPublisher = new Redis();


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

// socket-io connection 
io.on('connection', (socket) => {
  console.log('Mentor connected');

  socket.on('disconnect', () => {
      console.log('Mentor disconnected');
  });

  socket.on('sendMessageToStudent', (msg) => {
      console.log('Message to student:', msg);
      redisPublisher.publish('chatToStudent', msg);
  });

  redisSubscriber.subscribe('chatToMentor', (err, count) => {
      console.log(`Subscribed to chatToMentor channel`);
  });

  redisSubscriber.on('message', (channel, message) => {
      if (channel === 'chatToMentor') {
          console.log(`Message from student: ${message}`);
          socket.emit('message', message);
      }
  });
});


app.use(errorMiddleware);

// Wrapping express app with serverless-http
const handler = serverless(app);

export { server, handler };
