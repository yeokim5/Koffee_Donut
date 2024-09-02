import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch
import { selectCurrentToken } from "./authSlice";
import { logOut } from "./authSlice"; // Assuming logOut is defined in authSlice
import jwtDecode from "jwt-decode"; // Added jwtDecode import
import Cookies from "js-cookie"; // Import js-cookie

const PersistLogin = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken) || Cookies.get("token"); // Get token from cookies if not in state
  const [isLoading, setIsLoading] = useState(true);

  const [refresh] = useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      console.log("Verifying refresh token");
      try {
        await refresh(); // Attempt to refresh the token
      } catch (err) {
        console.error(err);
        // If refresh fails, log out the user
        dispatch(logOut()); // Use dispatch here
      } finally {
        setIsLoading(false);
      }
    };

    // Always try to refresh the token, regardless of the persist value
    if (!token) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, [token, refresh, dispatch]); // Added dependencies

  dispatch(logOut()); // Log out if token is expired
  // Check if the token is expired
  if (token && Date.now() >= jwtDecode(token).exp * 1000) {
    dispatch(logOut()); // Log out if token is expired
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <Outlet />;
};

export default PersistLogin;
