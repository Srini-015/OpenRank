export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated?.() && req.user) {
    return next();
  }

  return res.status(401).json({ message: "Authentication required." });
};
