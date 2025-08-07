import { Form, redirect } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export async function registerAction({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const bio = formData.get("bio");
  
  await axiosInstance.post("/auth/register", { name, email, password, bio });
  return redirect("/login");
}

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black px-4 font-sans">
      <Form
        method="post"
        className="w-full max-w-md bg-white border border-gray-300 rounded-2xl p-8 shadow-lg transition-all duration-500"
      >
        <h2 className="text-3xl font-bold text-center mb-6 tracking-tight">Register</h2>

        <input
          name="name"
          placeholder="Full Name"
          className="w-full border border-gray-300 p-3 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />

        <input
          name="email"
          placeholder="Email"
          className="w-full mt-4 border border-gray-300 p-3 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mt-4 border border-gray-300 p-3 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        />

        <textarea
          name="bio"
          placeholder="Short Bio"
          rows={3}
          className="w-full mt-4 border border-gray-300 p-3 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none"
        ></textarea>

        <button
          type="submit"
          className="w-full mt-6 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-black border-2 border-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Register
        </button>
      </Form>
    </div>
  );
}
