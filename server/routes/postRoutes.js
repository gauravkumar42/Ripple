const express = require("express");

const postController = require("../controllers/postController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuth, postController.getFeed);
router.get("/:id", optionalAuth, postController.getPost);
router.post("/", requireAuth, postController.createPost);
router.patch("/:id", requireAuth, postController.updatePost);
router.delete("/:id", requireAuth, postController.deletePost);
router.post("/:id/like", requireAuth, postController.toggleLike);
router.post("/:id/comments", requireAuth, postController.addComment);
router.delete("/:id/comments/:commentId", requireAuth, postController.deleteComment);

module.exports = router;
