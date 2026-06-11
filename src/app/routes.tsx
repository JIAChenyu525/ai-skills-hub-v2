import { createHashRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SkillDetail from "./components/SkillDetail";
import Submit from "./components/Submit";
import Admin from "./components/Admin";
import Guide from "./components/Guide";
import ProfilePage from "./components/Profile";
import UserPage from "./components/UserPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "skill/:slug", Component: SkillDetail },
      { path: "submit", Component: Submit },
      { path: "admin", Component: Admin },
      { path: "guide", Component: Guide },
      { path: "profile", Component: ProfilePage },
      { path: "user/:username", Component: UserPage },
    ],
  },
]);
