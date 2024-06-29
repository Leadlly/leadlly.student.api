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
exports.handler = exports.app = void 0;
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
const serverless_http_1 = __importDefault(require("serverless-http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_winston_1 = __importDefault(require("express-winston"));
const winston_1 = __importDefault(require("winston"));
const error_1 = __importDefault(require("./middlewares/error"));
const auth_1 = __importDefault(require("./routes/auth"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const user_1 = __importDefault(require("./routes/user"));
const planner_1 = __importDefault(require("./routes/planner"));
const question_1 = __importDefault(require("./routes/question"));
(0, dotenv_1.config)({
    path: "./.env",
});
const app = (0, express_1.default)();
exports.app = app;
app.use(express_winston_1.default.logger({
    transports: [
        new winston_1.default.transports.Console(),
    ],
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.cli()),
    meta: true,
    expressFormat: true,
    colorize: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL, 'https://education.leadlly.in', "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
// routes
app.use("/api/auth", auth_1.default);
app.use("/api/google", googleAuth_1.default);
app.use("/api/subscribe", subscriptionRoutes_1.default);
app.use("/api/course", courseRoutes_1.default);
app.use("/api/user", user_1.default);
app.use("/api/planner", planner_1.default);
app.use("/api/questionbank", question_1.default);
app.get("/", (req, res) => {
    res.send("Hello, world!");
});
app.use(error_1.default);
// Wrapping express app with serverless-http
const handler = (0, serverless_http_1.default)(app);
exports.handler = handler;
