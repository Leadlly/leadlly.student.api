import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { createApiKey, listApiKeys, revokeApiKey } from "../controllers/ApiKey";

const router = express.Router();

// Only authenticated admin users should access these routes
router.post("/create", checkAuth, createApiKey);
router.get("/list", checkAuth, listApiKeys);
router.put("/revoke/:id", checkAuth, revokeApiKey);

export default router;