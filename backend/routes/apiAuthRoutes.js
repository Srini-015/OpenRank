import express from "express";
import { getCurrentUser } from "../controllers/authController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", ensureAuthenticated, getCurrentUser);

export default router;
