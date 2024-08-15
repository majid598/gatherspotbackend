import express from "express";
import {
  editProfile,
  followToAuser,
  getOtherUser,
  login,
  logout,
  myNotifications,
  myProfile,
  newUser,
  removeAFollower,
  singleStory,
  stories,
  uploadStory,
  users,
} from "../Controllers/user.js";
import { isAuthenticated } from "../Middlewares/auth.js";
const router = express.Router();

router.post("/new", newUser);

router.post("/login", login);

router.get("/logout", isAuthenticated, logout);

router.put("/profile/edit", isAuthenticated, editProfile);

router.put("/follower/remove", isAuthenticated, removeAFollower);

router.get("/me", isAuthenticated,  myProfile);

router.get("/all", isAuthenticated, users);

router.put("/follow", isAuthenticated, followToAuser);

router.get("/notifications/my", isAuthenticated, myNotifications);

router.post("/story/upload", isAuthenticated, uploadStory);

router.get("/story/all", isAuthenticated, stories);

router.get("/story/:id", isAuthenticated, singleStory);

router.get("/other/:id", isAuthenticated, getOtherUser);

export default router;
