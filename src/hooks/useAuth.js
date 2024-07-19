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

  if (token) {
    const decoded = jwtDecode(token);
    const { username: decodedUsername, roles: decodedRoles } = decoded.UserInfo;

    username = decodedUsername;
    roles = decodedRoles;

    isManager = roles.includes("Manager");
    isAdmin = roles.includes("Admin");

    if (isManager) status = "Manager";
    if (isAdmin) status = "Admin";
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
