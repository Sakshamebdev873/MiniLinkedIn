import { createBrowserRouter } from "react-router-dom";
import Feed, { feedLoader, createPostAction } from "../pages/Feed.jsx";
import Login, { loginAction } from "../pages/Login.jsx";
import Register, { registerAction } from "../pages/Register.jsx";
import Profile, { profileLoader } from "../pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Feed />,
    loader: feedLoader,
    action: createPostAction
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction
  },
  {
    path: "/register",
    element: <Register />,
    action: registerAction
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
    loader: profileLoader
  }
]);

export default router;
