import { TryCatch } from "../Middlewares/error.js";
import { Notification } from "../Models/notification.js";
import { Post } from "../Models/post.js";
import { User } from "../Models/user.js";
import { uploadFilesToCloudinary } from "../Utils/features.js";
import ErrorHandler from "../Utils/utility.js";

const newPost = TryCatch(async (req, res, next) => {
  const { title, caption, type } = req.body;
  const file = req.file
  const userId = req.user;
  if (!userId || !caption || !file)
    return next(new ErrorHandler("All Fields Are Rrequired", 404));

  const result = await uploadFilesToCloudinary([file])

  const attachMent = {
    public_id: result[0].public_id,
    url: result[0].url
  }

  const post = await Post.create({
    user: userId,
    title,
    caption,
    type,
    attachMent,
  });
  const user = await User.findById(userId);
  user.posts.push(post);
  await user.save();
  // const

  return res.status(200).json({
    success: true,
    message: "Post Created",
  });
});
const allPosts = TryCatch(async (req, res, next) => {
  const posts = await Post.find({ type: { $in: ["Photo", "Video"] } })
    .sort({ createdAt: -1 })
    .populate("user", "username fullName profile")
  return res.status(200).json({
    success: true,
    posts,
  });
});
const myAllPosts = TryCatch(async (req, res, next) => {
  const posts = await Post.find({ user: req.user })
    .sort({ createdAt: -1 })
    .populate("user", "username fullName profile")
  return res.status(200).json({
    success: true,
    posts,
  });
});
const myPhotos = TryCatch(async (req, res, next) => {
  const photos = await Post.find({ type: "Photo", user: req.user })
    .sort({ createdAt: -1 })
  return res.status(200).json({
    success: true,
    photos,
  });
});
const myVideos = TryCatch(async (req, res, next) => {
  const videos = await Post.find({ type: "Video", user: req.user })
    .sort({ createdAt: -1 })
  return res.status(200).json({
    success: true,
    videos,
  });
});
const myReels = TryCatch(async (req, res, next) => {
  const reels = await Post.find({ type: "Reel", user: req.user })
    .sort({ createdAt: -1 })
  return res.status(200).json({
    success: true,
    reels,
  });
});
const singlePost = TryCatch(async (req, res, next) => {
  const post = await Reel.findById(req.params.id).populate(
    "user",
    "username fullName profile"
  );
  return res.status(200).json({
    success: true,
    post,
  });
});
const likeToPost = TryCatch(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user;
  if (!userId || !postId)
    return next(new ErrorHandler("Couldn't like this post", 404));
  const post = await Post.findById(postId).populate("user", "fullName");
  const liker = await User.findById(userId);
  const user = await User.findById(post.user._id);
  if (post.likes.indexOf(userId) === -1) {
    post.likes.push(userId);
    const notification = await Notification.create({
      message: `${liker.username} liked your post`,
      sender: liker._id,
      reciever: user._id,
    });
    user.notifications.push(notification);
  } else {
    post.likes.splice(post.likes.indexOf(userId), 1);
  }
  await post.save();
  await user.save();
  return res.status(200).json({
    success: true,
  });
});
const allReels = TryCatch(async (req, res, next) => {
  const reels = await Post.find({ type: "Reel" })
    .sort({ createdAt: -1 })
    .populate("user", "username fullName profile");
  return res.status(200).json({
    success: true,
    reels,
  });
});
const viewsPlus = TryCatch(async (req, res, next) => {
  const reelId = req.params.id;
  const { userId } = req.body;

  const reel = await Reel.findById(reelId);
  if (!reel) return next("Reel not found", 404);

  if (!reel.viewsByUser.includes(userId)) {
    reel.views++;
    reel.viewsByUser.push(userId);
    await reel.save();
  }

  res.status(200).json({ message: "View count incremented successfully" });
});

const deletePost = TryCatch(async (req, res, next) => {
  const postId = req.params.id;
  if (!postId) return next(new ErrorHandler("Couldn't delete this post", 404));
  const post = await Post.findById(postId);
  const user = await User.findById(req.user);
  user.posts.pull(post._id);
  await post.deleteOne()
  await user.save
  return res.status(200).json({
    success: true,
    message: "Post Deleted",
  });
});

export {
  newPost,
  allPosts,
  likeToPost,
  allReels,
  singlePost,
  viewsPlus,
  deletePost,
  myPhotos,
  myVideos,
  myReels,
  myAllPosts
};
