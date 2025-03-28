import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useSetUsernameMutation } from "../features/auth/authApiSlice";

const USER_REGEX = /^[A-Za-z0-9_]{3,20}$/;

const SetUsername = () => {
  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [setUsernameMutation] = useSetUsernameMutation();

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validUsername) {
      setError(
        "Invalid username. Please use 3-20 letters, numbers, or underscores."
      );
      return;
    }

    try {
      const { tempToken } = location.state;
      const response = await setUsernameMutation({
        username,
        tempToken,
      }).unwrap();
      dispatch(setCredentials({ accessToken: response.accessToken }));
      navigate("/");
    } catch (err) {
      if (err.status === 500) {
        setError("Username Already Exists");
      } else {
        setError(err.data?.message || "Failed to set username");
      }
    }
  };

  return (
    <div className="new-user-form">
      <h2>Choose Your Username</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username" className="form__label">
          Username[3-20 letters, numbers, or underscores]:
        </label>
        <input
          type="text"
          id="username"
          className={`form__input ${
            validUsername ? "" : "form__input--incomplete"
          }`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username (3-20 letters, numbers, or underscores)"
          required
        />
        <button
          type="submit"
          className="form__submit-button"
          disabled={!validUsername}
        >
          Set Username
        </button>
      </form>
      {error && <p className="errmsg">{error}</p>}
    </div>
  );
};

export default SetUsername;
