export const notFoundHandler = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error.",
    ...(process.env.NODE_ENV === "production"
      ? {}
      : {
          stack: error.stack,
        }),
  });
};
