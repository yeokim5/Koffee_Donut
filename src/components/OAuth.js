// OAuth.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useGoogleLoginMutation } from "../features/auth/authApiSlice";
import googleIcon from "../img/google-icon.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import PulseLoader from "react-spinners/PulseLoader";

const OAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [googleLogin] = useGoogleLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultFromGoogle = await signInWithPopup(auth, provider);

      const payload = {
        name: resultFromGoogle.user.displayName,
        email: resultFromGoogle.user.email,
      };

      console.log("Payload being sent to server:", payload);

      const { accessToken } = await googleLogin(payload).unwrap();

      console.log("Received data from server:", { accessToken });

      dispatch(setCredentials({ accessToken }));

      navigate("/dash");
    } catch (error) {
      console.error("Error during Google authentication:", error);
      setError(
        error.data?.message ||
          error.message ||
          "An error occurred during authentication"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <PulseLoader color={"#FFF"} />;

  return (
    <>
      <button
        type="button"
        className="login-button"
        onClick={handleGoogleClick}
        disabled={isLoading}
      >
        <img src={googleIcon} alt="Google logo" height={25} />{" "}
        <span style={{ marginLeft: "3px" }}>Continue with Google</span>
      </button>

      {error && <p className="error-message">{error}</p>}
    </>
  );
};

export default OAuth;
