import express from "express";
import {
  allPosts,
  allReels,
  deletePost,
  likeToPost,
  myAllPosts,
  myDraft,
  myPhotos,
  myReels,
  myVideos,
  newPost,
  singlePost,
  viewsPlus
} from "../Controllers/post.js";
import { isAuthenticated } from "../Middlewares/auth.js";
import { multerUpload } from "../Middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuthenticated, multerUpload.single("file"), newPost);
router.get("/all", isAuthenticated, allPosts);
router.get("/my/all", isAuthenticated, myAllPosts);
router.get("/my/photos", isAuthenticated, myPhotos);
router.get("/my/videos", isAuthenticated, myVideos);
router.put("/view/:id", isAuthenticated, viewsPlus)
router.get("/my/reels", isAuthenticated, myReels);
router.get("/my/drafts", isAuthenticated, myDraft);
router.get("/with/:id", isAuthenticated, singlePost);
router.get("/like/:id", isAuthenticated, likeToPost);
router.put("/reel/:id/view", isAuthenticated, viewsPlus);
router.get("/reel/all", isAuthenticated, allReels);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.get("/get-cloud");
export default router;
