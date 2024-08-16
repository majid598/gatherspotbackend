import mongoose, { model } from "mongoose";
import validator from "validator";
import { hash } from "bcrypt";

const schema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    credits: { type: Number, default: 0 },
    account: String,
    profile: {
      public_id: String,
      url: String,
    },
    coverPhoto: {
      public_id: String,
      url: String,
    },
    bio: {
      type: String,
      default: ""
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    websiteLink: String,
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
});

export const User = mongoose.models.User || model("User", schema);
