import express from "express";
import {
  acceptRequest,
  blockUser,
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
  myFriends,
  myNotifications,
  myProfile,
  myRequests,
  newUser,
  removeAFollower,
  requestPasswordReset,
  reset,
  resetPassword,
  sendFriendRequest,
  singleStory,
  stories,
  unblockUser,
  uploadStory,
  users,
} from "../Controllers/user.js";
import { isAuthenticated } from "../Middlewares/auth.js";
import { multerUpload } from "../Middlewares/multer.js"
const router = express.Router();

router.post("/new", newUser);
router.post("/login", login);
router.use(isAuthenticated)
router.get("/logout", logout);
router.put("/profile/edit", editProfile);
router.put("/profile/edit/cover-photo", multerUpload.single("file"), editCoverPhoto);
router.put("/profile/edit/profile-photo", multerUpload.single("file"), editProfilePhoto);
router.put("/profile/edit/bio", editBio);
router.put("/follower/remove", removeAFollower);
router.put("/send-request", sendFriendRequest);
router.get("/request/my", myRequests);
router.put("/request/accept/:id", acceptRequest);
router.get("/friends/my", myFriends);
router.get("/my/reset", reset);
router.put("/change/password", changePassword);
router.get("/me", myProfile);
router.post("/forgot/password", requestPasswordReset);
router.post("/password/reset/:token", resetPassword);
router.get("/all", users);
router.get("/:id/follow", followToAuser);
router.get("/:id/block", blockUser);
router.get("/:id/unblock", unblockUser);
router.get("/notifications/my", myNotifications);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);
router.post("/story/upload", uploadStory);
router.get("/story/all", stories);
router.get("/story/:id", singleStory);
router.get("/get/:id", getOtherUser);

export default router;
