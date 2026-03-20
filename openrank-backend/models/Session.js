import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    session: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.models.Session ||
  mongoose.model("Session", sessionSchema);
