import mongoose, { model } from "mongoose";

const schema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Notification =
  mongoose.models.Notification || model("Notification", schema);
