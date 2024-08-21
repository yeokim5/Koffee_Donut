import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";

const PersistLogin = () => {
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
  const [isLoading, setIsLoading] = useState(true);

  const [refresh] = useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      console.log("Verifying refresh token");
      try {
        await refresh();
      } catch (err) {
        console.error(err);
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
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <Outlet />;
};

export default PersistLogin;
