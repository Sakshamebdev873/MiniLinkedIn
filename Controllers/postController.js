import Post from '../Models/Post.js'
import User from '../Models/User.js'
import createPostSchema from '../Validators/postValidator.js'
import jwt from 'jsonwebtoken'


const createPost = async (req, res) => {
  // 1. Validate post data
  const { error } = createPostSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // 2. Get token from Authorization header (preferred) or body (fallback)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.body.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 4. Create post
    const post = await Post.create({
      author: userId,
      content: req.body.content,
      createdAt: new Date(), // Explicitly set for consistency
    });

    // 5. Populate author details
    const populatedPost = await Post.findById(post._id).populate('author', 'name');

    // 6. Emit newPost event via Socket.IO
    const io = req.app.get('io');
    if (!io) {
      console.error('Socket.IO instance not found');
    } else {
      console.log('Emitting newPost:', {
        _id: populatedPost._id,
        content: populatedPost.content,
        createdAt: populatedPost.createdAt,
        author: { name: populatedPost.author?.name || 'Anonymous' },
      });
      io.emit('newPost', {
        _id: populatedPost._id,
        content: populatedPost.content,
        createdAt: populatedPost.createdAt,
        author: { name: populatedPost.author?.name || 'Anonymous' },
      });
    }

    // 7. Send response
    res.status(201).json({ success: true, post: populatedPost });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const userExists = await User.findById(req.params.userId);
    if (!userExists) return res.status(404).json({ error: 'User not found' });
const id = req.params.userId
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(posts,id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {createPost,getAllPosts,getPostsByUser}