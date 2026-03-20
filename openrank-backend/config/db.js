import "dotenv/config";
import mongoose from "mongoose";

const DEFAULT_DEV_MONGO_URI = "mongodb://127.0.0.1:27017/openrank";

const resolveMongoUri = () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri || mongoUri === "your_mongodb_url") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGO_URI is required in production.");
    }

    console.warn(
      `MONGO_URI is missing or using the default placeholder. Falling back to ${DEFAULT_DEV_MONGO_URI}`
    );
    return DEFAULT_DEV_MONGO_URI;
  }

  if (
    !mongoUri.startsWith("mongodb://") &&
    !mongoUri.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      'Invalid MONGO_URI. It must start with "mongodb://" or "mongodb+srv://".'
    );
  }

  return mongoUri;
};

const connectDB = async () => {
  try {
    await mongoose.connect(resolveMongoUri());
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
