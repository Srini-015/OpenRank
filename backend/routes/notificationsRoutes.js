import express from "express";
import {
  getNotifications,
  updateNotificationStatus,
} from "../controllers/notificationsController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getNotifications);
router.patch("/:notificationId", ensureAuthenticated, updateNotificationStatus);

export default router;
