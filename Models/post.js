import mongoose, { model } from "mongoose";

const schema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Photo", "Video", "Reel", "Audio"],
      required: true
    },
    title: {
      type: String,
    },
    caption: {
      type: String,
      required: true,
    },
    attachMent: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    share: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    save: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.models.Post || model("Post", schema);
