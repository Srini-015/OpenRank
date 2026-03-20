import express from "express";
import { getDashboardOverview } from "../controllers/dashboardController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", ensureAuthenticated, getDashboardOverview);

export default router;
