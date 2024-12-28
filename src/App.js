import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import NotesList from "./features/notes/NotesList";
import UsersList from "./features/users/UsersList";
import EditUser from "./features/users/EditUser";
import NewUserForm from "./features/users/NewUserForm";
import EditNote from "./features/notes/EditNote";
import NewNote from "./features/notes/NewNote";
import Prefetch from "./features/auth/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/auth/RequireAuth";
import { ROLES } from "./config/roles";
import useTitle from "./hooks/useTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAccount from "./features/users/UserAccount";
import SetUsername from "./components/SetUsrename";
import About from "./components/About";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { logOut } from "./features/auth/authSlice";
<script src="https://www.google.com/recaptcha/api.js" async defer></script>;

function App() {
  useTitle("Koffee Donut");
  <ToastContainer />;

  const dispatch = useDispatch();
  useEffect(() => {
    // Check if the JWT cookie exists on app load
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      dispatch(logOut());
    }
  }, [dispatch]);

  const cleanupPendingImages = async () => {
    try {
      // Get pending images from local storage
      const pendingImages = JSON.parse(
        localStorage.getItem("pendingImage") || "[]"
      );

      if (pendingImages.length === 0) return;

      // Extract just the filenames from the full URL
      const fileNames = pendingImages
        .map((url) => {
          try {
            return url.split("/").pop();
          } catch (error) {
            console.error("Error parsing URL:", url);
            return null;
          }
        })
        .filter(Boolean);

      // Delete the images
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/delete-images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileNames }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete images");
      }

      // Clear pending images from local storage after successful deletion
      localStorage.setItem("pendingImage", JSON.stringify([]));
      console.log("Successfully cleaned up pending images");
    } catch (error) {
      console.error("Error cleaning up pending images:", error);
      toast.error(`Failed to clean up pending images: ${error.message}`);
    }
  };

  // Modified useEffect in App.js
  useEffect(() => {
    cleanupPendingImages();
  }, []);

  return (
    <Routes>
      <Route element={<PersistLogin />}>
        <Route path="/" element={<DashLayout />}>
          {/* public routes */}
          <Route index element={<Public />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="dash/notes/:id" element={<EditNote />} />
          <Route path="dash/users/:username" element={<UserAccount />} />
          <Route path="dash/users/new" element={<NewUserForm />} />
          <Route path="/set-username" element={<SetUsername />} />

          {/* Protected Routes */}
          <Route
            element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}
          >
            <Route element={<Prefetch />}>
              <Route path="dash">
                <Route index element={<Welcome />} />

                <Route
                  element={
                    <RequireAuth allowedRoles={[ROLES.Manager, ROLES.Admin]} />
                  }
                >
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path="new" element={<NewUserForm />} />
                  </Route>
                </Route>

                <Route path="notes">
                  <Route index element={<NotesList />} />
                  <Route path="new" element={<NewNote />} />
                </Route>
              </Route>
              {/* End Dash */}
            </Route>
          </Route>
        </Route>
        {/* End Protected Routes */}
      </Route>
    </Routes>
  );
}

export default App;
