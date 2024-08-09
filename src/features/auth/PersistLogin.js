import { Outlet } from "react-router-dom";
<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useRef, useState } from "react";
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";

const PersistLogin = () => {
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
<<<<<<< HEAD
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
=======
  const effectRan = useRef(false);

  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      const verifyRefreshToken = async () => {
        console.log("verifying refresh token");
        try {
          await refresh();
          setTrueSuccess(true);
        } catch (err) {
          console.error(err);
        }
      };

      if (!token && persist) verifyRefreshToken();
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  let content;
  // if (!persist) {
  //   console.log("no persist");
  //   content = <Outlet />;
  // } else if (isLoading) {
  //   console.log("loading");
  //   content = <p>Loading...</p>;
  // } else if (isError) {
  //   console.log("error");
  //   content = <Outlet />;
  // } else if (isSuccess && trueSuccess) {
  //   console.log("success");
  //   content = <Outlet />;
  // } else if (token && isUninitialized) {
  //   console.log("token and uninit");
  //   content = <Outlet />;
  // } else {
  //   console.log("no token");
  // content = <Outlet />;
  // }

  content = <Outlet />;
  return content;
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48
};

export default PersistLogin;
