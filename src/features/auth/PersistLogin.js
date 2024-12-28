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

  const [refresh] = useRefreshMutation();

  const token = useSelector(selectCurrentToken);
  const [triedRefresh, setTriedRefresh] = useState(false);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setTriedRefresh(true);
      }
    };

    if (!token && !triedRefresh && persist) {
      verifyRefreshToken();
    } else {
      setTriedRefresh(true);
    }
  }, [token, refresh, persist]);

  if (!triedRefresh) {
    return <p>Loading...</p>;
  }

  return <Outlet />;
};

export default PersistLogin;
