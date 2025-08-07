import express from 'express'
import {createPost,getAllPosts,getPostsByUser} from '../Controllers/postController.js'
import authMiddleware from '../Middleware/authMiddleware.js'
const router = express.Router();

router.post('/posts', authMiddleware,createPost);
router.get('/posts', getAllPosts);
router.get('/posts/user/:userId', getPostsByUser);

export default router