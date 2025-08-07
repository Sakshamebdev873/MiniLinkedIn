import express from 'express'
import {createPost,getAllPosts,getPostsByUser} from '../Controllers/postController.js'
import authMiddleware from '../Middleware/authMiddleware.js'
const router = express.Router();

router.post('/', authMiddleware,createPost);
router.get('/', getAllPosts);
router.get('/user/:userId', getPostsByUser);

export default router