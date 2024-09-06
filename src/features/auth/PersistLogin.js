import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken, logOut } from "./authSlice";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie";

const PersistLogin = () => {
  const dispatch = useDispatch();
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken) || Cookies.get("token");
  const [isLoading, setIsLoading] = useState(true);

  const [refresh] = useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      console.log("Verifying refresh token");
      try {
        await refresh();
      } catch (err) {
        console.error(err);
        dispatch(logOut());
      } finally {
        setIsLoading(false);
      }
    };

    if (!token) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    // // Set up auto-logout
    // const autoLogoutTimer = setTimeout(() => {
    //   console.log("Auto-logout triggered");
    //   dispatch(logOut());
    // }, 30000); // 30 seconds

    // return () => clearTimeout(autoLogoutTimer);
  }, [token, refresh, dispatch]);

  // Check if the token is expired
  if (token) {
    const decodedToken = jwtDecode(token);
    if (Date.now() >= decodedToken.exp * 1000) {
      console.log("Token expired, logging out");
      dispatch(logOut());
    }
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <Outlet />;
};

export default PersistLogin;
