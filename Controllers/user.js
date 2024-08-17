import { User } from "../Models/user.js";
import { Request } from "../Models/request.js";
import { TryCatch } from "../Middlewares/error.js";
import ErrorHandler from "../Utils/utility.js";
import { cookieOptions, sendToken, uploadFilesToCloudinary } from "../Utils/features.js";
import { compare, hash } from "bcrypt";
import { Story } from "../Models/story.js";
import cron from "node-cron";
import { Notification } from "../Models/notification.js";
import { v2 as cloudinary } from 'cloudinary'
import crypto from 'crypto'

const newUser = TryCatch(async (req, res, next) => {
  console.log(req.body);

  const { email, fullName, username, password } = req.body;
  console.log(email, fullName, username, password);

  if (!email || !fullName || !username || !password)
    return next(new ErrorHandler("All Feilds Are Required", 404));

  const user = await User.create({
    email,
    fullName,
    username,
    password,
  });
  sendToken(res, user, 200, `Account Registration Successful`);
});
const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email Or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch) return next(new ErrorHandler("Invalid Email Or Password", 404));

  sendToken(res, user, 200, `Welcome Back Mr ${user.fullName}`);
});
const myProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user)
    .populate("posts", "attachMent")
    .populate("favorites", "attachMent views")
    .populate("story", "attachMent caption")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    user,
  });
});
const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("insta-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
const editProfile = TryCatch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user, req.body)
  return res.status(200).json({ success: true, message: "Profile updated" });
});
const editCoverPhoto = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Delete previous cover photo if it exists
  if (user?.coverPhoto?.public_id) {
    try {
      await cloudinary.uploader.destroy(user.coverPhoto.public_id);
      console.log('Previous photo deleted successfully');
    } catch (error) {
      console.error('Error deleting previous photo:', error);
      return res.status(500).json({ success: false, message: "Error deleting previous photo" });
    }
  }

  // Upload the new photo to Cloudinary
  const result = await uploadFilesToCloudinary([file]);
  if (!result || result.length === 0) {
    return res.status(500).json({ success: false, message: "Error uploading new photo" });
  }

  // Update user's cover photo details
  const coverPhoto = {
    public_id: result[0].public_id,
    url: result[0].url
  };
  user.coverPhoto = coverPhoto;
  await user.save();

  return res.status(200).json({ success: true, message: "CoverPhoto updated", coverPhoto });
});
const editProfilePhoto = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Delete previous cover photo if it exists
  if (user?.profile?.public_id) {
    try {
      await cloudinary.uploader.destroy(user.profile.public_id);
      console.log('Previous photo deleted successfully');
    } catch (error) {
      console.error('Error deleting previous photo:', error);
      return res.status(500).json({ success: false, message: "Error deleting previous photo" });
    }
  }

  // Upload the new photo to Cloudinary
  const result = await uploadFilesToCloudinary([file]);
  if (!result || result.length === 0) {
    return res.status(500).json({ success: false, message: "Error uploading new photo" });
  }

  // Update user's cover photo details
  const profile = {
    public_id: result[0].public_id,
    url: result[0].url
  };
  user.profile = profile;
  await user.save();

  return res.status(200).json({ success: true, message: "Profile updated" });
});
const editBio = TryCatch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user, req.body)
  return res.status(200).json({ success: true, message: "Profile updated" });
});
const followToAuser = TryCatch(async (req, res, next) => {
  const userId = req.params.id;
  const followerId = req.user;
  // Find the user who is removing the follower
  const user = await User.findById(userId);
  const follower = await User.findById(followerId);

  if (!user) return next(new ErrorHandler("User not found", 400));

  // Remove the follower from the user's followers list
  if (user.followers.indexOf(followerId) === -1) {
    user.followers.push(followerId);
    const notification = await Notification.create({
      message: `${follower.username} started following you`,
      reciever: user._id,
    });
    user.notificationCount++
  } else {
    user.followers.splice(user.followers.indexOf(followerId), 1);
  }
  if (follower.following.indexOf(userId) === -1) {
    follower.following.push(userId);
  } else {
    follower.following.splice(follower.following.indexOf(userId), 1);
  }
  await user.save();
  await follower.save();
  return res.status(200).json({
    success: true,
    message: `You Followed ${user.fullName}`,
  });
});
const getOtherUser = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate("posts", "attachMent");

  return res.status(200).json({
    success: true,
    user,
  });
});
const getFollowers = TryCatch(async (req, res, next) => {
  const followers = await User.find({ following: req.query.id })

  return res.status(200).json({
    success: true,
    followers,
  });
});
const getFollowing = TryCatch(async (req, res, next) => {
  const following = await User.find({ followers: req.query.id })

  return res.status(200).json({
    success: true,
    following,
  });
});
const removeAFollower = TryCatch(async (req, res, next) => {
  const { userId, followerId } = req.body;

  // Find the user who is removing the follower
  const user = await User.findById(userId);
  const follower = await User.findById(followerId);

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Remove the follower from the user's followers list
  user.followers.pull(followerId);
  follower.following.pull(userId);
  await user.save();
  await follower.save();

  return res.status(200).json({ success: true, message: "Follower Removed" });
});
const uploadStory = TryCatch(async (req, res, next) => {
  const { caption, attachMent } = req.body;
  const userId = req.user;
  if (!caption || !attachMent)
    return next(new ErrorHandler("All fields Are required", 404));
  const user = await User.findById(userId);

  const story = await Story.create({ user: userId, caption, attachMent });
  user.story = story;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Story Updated",
  });
});
const stories = TryCatch(async (req, res, next) => {
  const stories = await Story.find({});

  return res.status(200).json({ success: true, stories });
});
const singleStory = TryCatch(async (req, res, next) => {
  const story = await Story.findById(req.params.id).populate(
    "user",
    "fullName username profile"
  );

  return res.status(200).json({ success: true, story });
});
const myNotifications = TryCatch(async (req, res, next) => {
  const userId = req.query.id;
  const notifications = await Notification.find({
    reciever: req.query.id,
  }).populate("sender", "fullName username profile");
  return res.status(200).json({ success: true, notifications });
});
const changePassword = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user).select("+password");
  const { oldPassword, newPassword } = req.body
  if (!oldPassword && !newPassword) return next(new ErrorHandler("All fields Are required", 400))
  if (!oldPassword) return next(new ErrorHandler("old password is required", 400))
  if (!newPassword) return next(new ErrorHandler("new password is required", 400))
  await user.changePassword(oldPassword, newPassword);
  return res.status(200).json({ success: true, message: "password changed successfully" })
})
const users = TryCatch(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user } })
  return res.status(200).json({ success: true, users });
});
const requestPasswordReset = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new ErrorHandler("Email is required", 404))
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404))

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

  await user.save();

  // Send email
  const resetUrl = `http://yourdomain.com/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested to reset your password. Please click the following link to reset your password:\n\n${resetUrl}`;

  res.status(200).json({ success: true, message: "Password reset email sent.", token: resetTokenHash });
});
const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return res.status(400).send('Invalid or expired token.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
});
const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ErrorHandler("Request already sent", 400));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  // emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});

// const acceptFriendRequest = TryCatch(async (req, res, next) => {
//   const { requestId, accept } = req.body;

//   const request = await Request.findById(requestId)
//     .populate("sender", "name")
//     .populate("receiver", "name");

//   if (!request) return next(new ErrorHandler("Request not found", 404));

//   if (request.receiver._id.toString() !== req.user.toString())
//     return next(
//       new ErrorHandler("You are not authorized to accept this request", 401)
//     );

//   if (!accept) {
//     await request.deleteOne();

//     return res.status(200).json({
//       success: true,
//       message: "Friend Request Rejected",
//     });
//   }

//     request.deleteOne(),

//   // emitEvent(req, REFETCH_CHATS, members);

//   return res.status(200).json({
//     success: true,
//     message: "Friend Request Accepted",
//     senderId: request.sender._id,
//   });
// });

















cron.schedule("0 0 * * *", async () => {
  try {
    // Remove stories older than 24 hours
    await Story.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    console.log("Expired stories removed.");
  } catch (error) {
    console.error("Error removing expired stories:", error);
  }
});

export {
  newUser,
  login,
  myProfile,
  logout,
  followToAuser,
  editProfile,
  getOtherUser,
  removeAFollower,
  uploadStory,
  stories,
  singleStory,
  myNotifications,
  users,
  editCoverPhoto,
  editProfilePhoto,
  editBio,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getFollowers,
  getFollowing,
};
