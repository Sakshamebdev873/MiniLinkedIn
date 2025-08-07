import jwt from "jsonwebtoken"; 
import express from "express";
const app = express();

const authMiddleware = (req, res, next) => {
  // console.log("🔍 Authorization header received:", req.headers.authorization);

  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
