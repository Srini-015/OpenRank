import express from "express";
import {
  getCurrentUser,
  githubCallback,
  githubLogin,
  logoutUser,
} from "../controllers/authController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", ensureAuthenticated, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
