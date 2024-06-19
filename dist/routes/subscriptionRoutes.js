"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middlewares/checkAuth");
const Subscription_1 = require("../controllers/Subscription");
const router = express_1.default.Router();
//create subscription
router.post("/create", checkAuth_1.checkAuth, Subscription_1.buySubscription);
//verify subscription
router.post("/verify", checkAuth_1.checkAuth, Subscription_1.verifySubscription);
//cancel subscripiton
router.post("/cancel", checkAuth_1.checkAuth, Subscription_1.cancelSubscription);
exports.default = router;
