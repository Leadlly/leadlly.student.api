"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.server = void 0;
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
const serverless_http_1 = __importDefault(require("serverless-http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const error_1 = __importDefault(require("./middlewares/error"));
const user_1 = __importDefault(require("./routes/user"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const ioredis_1 = require("ioredis");
(0, dotenv_1.config)({
    path: "./.env",
});
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server);
const redisSubscriber = new ioredis_1.Redis();
const redisPublisher = new ioredis_1.Redis();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
// routes
app.use("/api/user", user_1.default);
app.use("/api/google", googleAuth_1.default);
app.use("/api/subscribe", subscriptionRoutes_1.default);
app.use("/api/course", courseRoutes_1.default);
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
app.use(error_1.default);
// Wrapping express app with serverless-http
const handler = (0, serverless_http_1.default)(app);
exports.handler = handler;
