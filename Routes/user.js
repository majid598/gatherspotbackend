import express from "express";
import {
  changePassword,
  editBio,
  editCoverPhoto,
  editProfile,
  editProfilePhoto,
  followToAuser,
  getFollowers,
  getFollowing,
  getOtherUser,
  login,
  logout,
  myNotifications,
  myProfile,
  newUser,
  removeAFollower,
  requestPasswordReset,
  resetPassword,
  singleStory,
  stories,
  uploadStory,
  users,
} from "../Controllers/user.js";
import { isAuthenticated } from "../Middlewares/auth.js";
import { multerUpload } from "../Middlewares/multer.js"
const router = express.Router();

router.post("/new", newUser);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.put("/profile/edit", isAuthenticated, editProfile);
router.put("/profile/edit/cover-photo", isAuthenticated, multerUpload.single("file"), editCoverPhoto);
router.put("/profile/edit/profile-photo", isAuthenticated, multerUpload.single("file"), editProfilePhoto);
router.put("/profile/edit/bio", isAuthenticated, editBio);
router.put("/follower/remove", isAuthenticated, removeAFollower);
router.put("/change/password", isAuthenticated, changePassword);
router.get("/me", isAuthenticated, myProfile);
router.post("/forgot/password", requestPasswordReset);
router.post("/password/reset/:token", resetPassword);
router.get("/all", isAuthenticated, users);
router.get("/:id/follow", isAuthenticated, followToAuser);
router.get("/notifications/my", isAuthenticated, myNotifications);
router.get("/followers", isAuthenticated, getFollowers);
router.get("/following", isAuthenticated, getFollowing);
router.post("/story/upload", isAuthenticated, uploadStory);
router.get("/story/all", isAuthenticated, stories);
router.get("/story/:id", isAuthenticated, singleStory);
router.get("/get/:id", isAuthenticated, getOtherUser);

export default router;
