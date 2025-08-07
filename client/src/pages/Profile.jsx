import { useLoaderData } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useEffect } from "react";
import gsap from "gsap";

// Loader to fetch user profile + posts
export async function profileLoader({ params }) {
  const { userId } = params;
  const userRes = await axiosInstance.get(`/auth/user/${userId}`);
  const postsRes = await axiosInstance.get(`/posts/user/${userId}`);
  
  return {
    user: userRes.data,
    posts: postsRes.data
  };
}

export default function Profile() {
  const { user, posts } = useLoaderData();

  // GSAP animation
  useEffect(() => {
    gsap.from(".profile-header", { opacity: 0, y: -20, duration: 0.5 });
    gsap.from(".profile-post", { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 });
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="profile-header border p-4 rounded shadow mb-4">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="mt-2">{user.bio}</p>
      </div>

      {/* User Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="profile-post border p-3 rounded shadow mb-3 hover:shadow-lg transition"
            >
              <p>{post.content}</p>
              <small className="text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
  );
}
