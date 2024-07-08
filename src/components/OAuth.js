import React from "react";
import googleIcon from "../img/google-icon.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // Import the initialized auth service

const handleGoogleClick = async () => {
  console.log(`clicked`);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const resultFromGoogle = await signInWithPopup(auth, provider);
    console.log(resultFromGoogle);
    // Here you can handle the successful sign-in, e.g., update your app's state
  } catch (error) {
    console.error(error);
  }
};

const OAuth = () => {
  return (
    <button
      type="button"
      className="form__submit-button"
      onClick={handleGoogleClick}
    >
      <img src={googleIcon} alt="Google logo" height={30} />
      <span>Continue with Google</span>
    </button>
  );
};

export default OAuth;
