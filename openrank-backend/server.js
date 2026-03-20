import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import passport from "passport";
import "./config/passport.js";
import { sessionMiddleware } from "./config/session.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import apiAuthRoutes from "./routes/apiAuthRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// DB
connectDB();

// Middleware
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : 0);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/auth", apiAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "OpenRank auth API is running." });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

export { app, server };
