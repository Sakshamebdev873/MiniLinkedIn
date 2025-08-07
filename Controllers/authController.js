import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../Models/User.js'
import { registerSchema, loginSchema } from '../Validators/userValidator.js'
const register = async (req, res) => {
  // Validate request
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, password, bio } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      bio
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  // Validate request
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;

  try {
    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// logoutController.js
let blacklistedTokens = []; // Simple in-memory list (use Redis in production)

const logoutUser = (req, res) => {
  try {
    

    // Get token from header or body
    let token = req.headers.authorization?.split(" ")[1] || req.body.token;

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    // Add token to blacklist
    blacklistedTokens.push(token);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
};


// Middleware to check blacklist
 const checkBlacklist = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    token = req.body?.token;
  }

  if (blacklistedTokens.includes(token)) {
    return res.status(401).json({ error: "Token is invalid (logged out)" });
  }
  next();
};
 const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password"); // remove password
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export {login,register,checkBlacklist,logoutUser,getUserById}
