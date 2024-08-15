import express from "express";
import {
  addComment,
  addToFavorites,
  allPosts,
  allReels,
  deletePost,
  likeToPost,
  likeToReel,
  newPost,
  singlePost,
  singleReel,
  uploadReal,
  viewsPlus,
} from "../Controllers/post.js";
import { isAuthenticated } from "../Middlewares/auth.js";
import { multerUpload } from "../Middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuthenticated, multerUpload.single("file"), newPost);

router.get("/all", isAuthenticated, allPosts);

router.get("/with/:id", isAuthenticated, singlePost);

router.get("/reel/with/:id", isAuthenticated, singleReel);

router.put("/like/post/:id", isAuthenticated, likeToPost);

router.put("/reel/:id/view", isAuthenticated, viewsPlus);

router.post("/reel/comment", isAuthenticated, addComment);

router.put("/like/reel", isAuthenticated, likeToReel);

router.put("/reel/add/favorites", isAuthenticated, addToFavorites);

router.post("/reel/new", isAuthenticated, uploadReal);

router.get("/reel/all", isAuthenticated, allReels);

router.delete("/delete/:id", isAuthenticated, deletePost);

export default router;
