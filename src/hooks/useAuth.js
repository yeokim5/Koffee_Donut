import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import jwtDecode from "jwt-decode";
import Cookies from "js-cookie"; // Import js-cookie

const useAuth = () => {
  const token = useSelector(selectCurrentToken) || Cookies.get("token"); // Get token from cookies if not in state
  let isManager = false;
  let isAdmin = false;
  let status = "Employee";
  let username = "";
  let roles = [];

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const {
        username: decodedUsername,
        roles: decodedRoles,
        exp,
      } = decoded.UserInfo;

      // Check if token is expired
      if (Date.now() >= exp * 1000) {
        console.log("Token is expired"); // Debugging line
        return {
          username: "",
          roles: [],
          status: "Employee",
          isManager: false,
          isAdmin: false,
          isAuthenticated: false,
        };
      }

      username = decodedUsername;
      roles = decodedRoles;

      if (isManager) status = "Manager";
      if (isAdmin) status = "Admin";
    } catch (error) {
      console.error("Error decoding token:", error); // Debugging line
    }
  }

  return {
    username,
    roles,
    status,
    isManager,
    isAdmin,
    isAuthenticated: Boolean(username),
  };
};

export default useAuth;
