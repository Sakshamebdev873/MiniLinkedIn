import React, { useEffect, useState, useRef } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import gsap from "gsap";

// Loader

export async function feedLoader() {
  const res = await axiosInstance.get("/posts");
  return res.data;
}
// Action
export async function createPostAction({ request }) {
  try {
    const formData = await request.formData();
    const content = formData.get("content")?.trim();
    const token = formData.get("token")?.trim();

    if (!content || !token) {
      throw new Error("Content and token are required");
    }

    const res = await axiosInstance.post(
      "/posts",
      { content },
      {
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Full error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });

    throw new Response(
      JSON.stringify({
        error: true,
        message: error.response?.data?.message || error.message,
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

import io from "socket.io-client"; // Install socket.io-client

const normalizePost = (post) => ({
  _id: post._id || Date.now().toString(),
  content: post.content || "",
  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
  author: post.author || { name: "Anonymous" },
});

export default function Feed() {
  const loadedPosts = useLoaderData();
  const actionData = useActionData();
  const [posts, setPosts] = useState(loadedPosts.map(normalizePost));
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigation = useNavigation();
  const navigate = useNavigate();
  const newPostRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUserClick = async (userId) => {
  setIsModalOpen(true);       // 🔥 Open modal immediately
  setLoading(true);           // 🔄 Show spinner
  setSelectedUser(null);      // (optional) Clear old data

  try {
    const userData = await getUserDetails(userId);
    setSelectedUser(userData); // ✅ Set data once fetched
  } catch (err) {
    console.error("Failed to fetch user details", err);
  } finally {
    setLoading(false);         // ✅ Hide spinner
  }
};

  // ✅ WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5100", {
      // Updated to port 5100
      withCredentials: true,
    }); // Replace with your WebSocket server URL

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("newPost", (newPost) => {
      const normalizedPost = normalizePost(newPost);
      console.log("New post received:", newPost);
      setPosts((prev) => {
        if (prev.some((p) => p._id === normalizedPost._id)) {
          return prev;
        }
        return [normalizedPost, ...prev].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ✅ Add new post after form submission
  useEffect(() => {
    if (actionData?.success && actionData.post) {
      const normalizedPost = normalizePost(actionData.post);
      setPosts((prev) => {
        if (prev.some((p) => p._id === normalizedPost._id)) {
          return prev;
        }
        return [normalizedPost, ...prev];
      });
    }
  }, [actionData]);

  // ✅ Animate newly added post
  useEffect(() => {
    if (newPostRef.current) {
      gsap.fromTo(
        newPostRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [posts]);
  const getUserDetails = async (userId) => {
    const res = await axiosInstance.get(`/auth/getuser/${userId}`);
    return res.data;
  };
  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      console.log("🔑 Token before logout:", token);
      const res = await axiosInstance.post("/auth/logout", { token });
      console.log(res.data.message);

      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error.response?.data || error.message);
    }
  };
 const [content, setContent] = useState("");
 

  // Reset content after successful post
  useEffect(() => {
    if (navigation.state === "idle") {
      setContent(""); // Clear textarea when post is done
    }
  }, [navigation.state]);
  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 🔐 Auth Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="border-gray-200 border bg-gray-200 px-4 py-2 hover:bg-black hover:text-white rounded-lg  transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-white border-2 border-gray-200 hover:text-black transition"
            >
              Register
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>

      {/* 📝 Create Post Form */}
      {isLoggedIn && (
       <Form
  method="post"
  className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 ease-in-out"
>
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Post</h2>

  <textarea
    name="content"
    placeholder="What's on your mind?"
    rows={4}
    onChange={(e) => setContent(e.target.value)}
    value={content}
    className="border border-gray-300 p-4 w-full rounded-xl resize-none text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
  />

  <input
    type="hidden"
    name="token"
    value={typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}
  />

  <button
    type="submit"
    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
  >
    {navigation.state === "submitting" ? "Posting..." : "Post"}
  </button>
</Form>

      )}

      {/* 🧾 Posts List */}
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === 0 ? newPostRef : null}
            className="post-card group p-6 mb-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {post?.author?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex flex-col">
               <button
  onClick={() => handleUserClick(post?.author?._id)}
  title="View profile"
  className="flex items-center gap-2 text-blue-600 font-semibold hover:underline hover:text-blue-700 cursor-pointer"
>
  <span>👤</span>
  <span>View {post?.author?.name || "User"}'s Profile</span>
</button>

                {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
    {loading ? (
      // Loading spinner
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    ) : (
      selectedUser && (
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-5xl font-bold"
          >
            &times;
          </button>
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center text-4xl font-bold shadow-md">
              {selectedUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">
              {selectedUser.name || "Unnamed User"}
            </h3>
            <p className="text-sm text-gray-600">{selectedUser.email || "No email available"}</p>
            {selectedUser.bio ? (
              <p className="text-center mt-2 text-gray-700">{selectedUser.bio}</p>
            ) : (
              <p className="text-center mt-2 text-gray-400 italic">No bio provided.</p>
            )}
          </div>
        </div>
      )
    )}
  </div>
)}


                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-10 text-base animate-pulse">
          No posts yet. Be the first to share something! 🚀
        </p>
      )}
    </div>
  );
}
