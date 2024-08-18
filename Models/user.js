import mongoose, { model } from "mongoose";
import validator from "validator";
import { hash, compare } from "bcrypt";

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
    friends: [
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
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    notificationCount: {
      type: Number,
      default: 0
    },
    websiteLink: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

schema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hash(this.password, 10);
  }
  next();
});

schema.methods.changePassword = async function (oldPassword, newPassword) {
  // Compare the old password with the current password
  const isMatch = await compare(oldPassword, this.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }
  // Update the password and save the user
  this.password = newPassword
  await this.save();
};

export const User = mongoose.models.User || model("User", schema);
