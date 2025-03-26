import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import jwtDecode from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isManager = false;
  let isAdmin = false;
  let status = "Employee";
  let username = "";
  let roles = [];
  let userId = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const {
        username: decodedUsername,
        roles: decodedRoles,
        exp,
        userId: decodedUserId,
      } = decoded.UserInfo;

      // Check if token is expired
      if (Date.now() >= exp * 1000) {
        console.log("Token is expired");
        return {
          username: "",
          roles: [],
          status: "Employee",
          isManager: false,
          isAdmin: false,
          isAuthenticated: false,
          userId: "",
        };
      }

      username = decodedUsername || "";
      roles = decodedRoles || [];
      userId = decodedUserId || "";

      // Log the data extracted from token for debugging
      // console.log("Token data:", { username, userId, roles });

      isManager = roles.includes("Manager");
      isAdmin = roles.includes("Admin");

      if (isManager) status = "Manager";
      if (isAdmin) status = "Admin";
    } catch (error) {
      console.error("Error decoding token:", error);
      return {
        username: "",
        roles: [],
        status: "Employee",
        isManager: false,
        isAdmin: false,
        isAuthenticated: false,
        userId: "",
      };
    }
  }

  // Explicitly consider a user authenticated if they have a username
  const isAuthenticated = Boolean(username && username.trim() !== "");

  return {
    username,
    roles,
    status,
    isManager,
    isAdmin,
    isAuthenticated,
    userId,
  };
};

export default useAuth;
