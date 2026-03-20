import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getLeaderboard);

export default router;
