import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import NotesList from "./features/notes/NotesList";
import UsersList from "./features/users/UsersList";
import EditUser from "./features/users/EditUser";
import Prefetch from "./features/auth/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/auth/RequireAuth";
import { ROLES } from "./config/roles";
import useTitle from "./hooks/useTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SetUsername from "./components/SetUsrename";
import { lazy, Suspense } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { logOut } from "./features/auth/authSlice";
import { cleanUpExpiredViews } from "../src/features/notes/utility";
import startKeepAliveService from "./services/keepAliveService";

<script src="https://www.google.com/recaptcha/api.js" async defer></script>;

// Use lazy loading for non-critical components
const About = lazy(() => import("./components/About"));
const UserAccount = lazy(() => import("./features/users/UserAccount"));
const NewUserForm = lazy(() => import("./features/users/NewUserForm"));
const EditNote = lazy(() => import("./features/notes/EditNote"));
const NewNote = lazy(() => import("./features/notes/NewNote"));

// Create a loading component for Suspense fallback
const LoadingComponent = () => (
  <div
    style={{
      padding: "20px",
      textAlign: "center",
      margin: "20px auto",
      maxWidth: "300px",
      backgroundColor: "#f8f8f8",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }}
  >
    <p>Loading...</p>
  </div>
);

function App() {
  useTitle("Koffee Donut");
  <ToastContainer />;

  const dispatch = useDispatch();

  useEffect(() => {
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
        dispatch(logOut());
      }
    };

    const intervalId = setInterval(checkTokenExpiry, 1000); // Check every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
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
    cleanUpExpiredViews();
    cleanupPendingImages();
    startKeepAliveService();
  }, []);

  return (
    <Routes>
      <Route>
        {/* <Route element={<PersistLogin />}> */}
        <Route path="/" element={<DashLayout />}>
          {/* public routes */}
          <Route index element={<Public />} />
          <Route
            path="about"
            element={
              <Suspense fallback={<LoadingComponent />}>
                <About />
              </Suspense>
            }
          />
          <Route path="login" element={<Login />} />
          <Route
            path="dash/notes/:id"
            element={
              <Suspense fallback={<LoadingComponent />}>
                <EditNote />
              </Suspense>
            }
          />
          <Route
            path="dash/users/:username"
            element={
              <Suspense fallback={<LoadingComponent />}>
                <UserAccount />
              </Suspense>
            }
          />
          <Route
            path="dash/users/new"
            element={
              <Suspense fallback={<LoadingComponent />}>
                <NewUserForm />
              </Suspense>
            }
          />
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
                    <Route
                      path="new"
                      element={
                        <Suspense fallback={<LoadingComponent />}>
                          <NewUserForm />
                        </Suspense>
                      }
                    />
                  </Route>
                </Route>

                <Route path="notes">
                  <Route index element={<NotesList />} />
                  <Route
                    path="new"
                    element={
                      <Suspense fallback={<LoadingComponent />}>
                        <NewNote />
                      </Suspense>
                    }
                  />
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
