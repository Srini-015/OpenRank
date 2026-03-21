import express from "express";
import {
  getRepositories,
  getRepositoryDetails,
} from "../controllers/repositoryController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getRepositories);
router.get("/:repoName", ensureAuthenticated, getRepositoryDetails);

export default router;
