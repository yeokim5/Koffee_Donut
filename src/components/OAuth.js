import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useGoogleLoginMutation } from "../features/auth/authApiSlice";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import googleIcon from "../img/google-icon.png";
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

      const response = await googleLogin(payload).unwrap();
      console.log("Received data from server:", response);

      if (response.isFirstTimeUser) {
        console.log("Redirecting to username setup...");
        navigate("/set-username", {
          state: {
            email: resultFromGoogle.user.email,
            tempToken: response.tempToken,
          },
        });
      } else {
        console.log("Logging in existing user...");
        dispatch(setCredentials({ accessToken: response.accessToken }));
        navigate("/");
      }
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

  return (
    <>
      <button
        type="button"
        className={`login-button ${isLoading ? "login-button-disabled" : ""}`}
        onClick={handleGoogleClick}
        disabled={isLoading}
      >
        <img
          src={googleIcon}
          className="google-icon"
          alt="Google logo"
          height={25}
        />
        <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
          {isLoading ? "Wait for Couple Seconds" : "Continue with Google"}
        </span>
      </button>

      {error && <p className="error-message">{error}</p>}
    </>
  );
};

export default OAuth;
