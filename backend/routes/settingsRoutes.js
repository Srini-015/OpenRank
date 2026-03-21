import express from "express";
import {
  deleteAccount,
  getSettings,
  updateGitHubConnection,
  updatePreferenceSettings,
  updateProfileSettings,
} from "../controllers/settingsController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getSettings);
router.put("/profile", ensureAuthenticated, updateProfileSettings);
router.put("/preferences", ensureAuthenticated, updatePreferenceSettings);
router.patch("/github", ensureAuthenticated, updateGitHubConnection);
router.delete("/account", ensureAuthenticated, deleteAccount);

export default router;
