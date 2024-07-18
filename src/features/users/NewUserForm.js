import { useState, useEffect, useRef } from "react";
import { useAddNewUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import ReCAPTCHA from "react-google-recaptcha";

const USER_REGEX = /^[A-Za-z0-9]{3,20}$/;
const PWD_REGEX = /^(?=.*\d)[A-Za-z\d]{8,20}$/;

const NewUserForm = () => {
  useTitle("New User");

  const [addNewUser, { isLoading, isSuccess, isError, error }] =
    useAddNewUserMutation();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState("");

  const captchaRef = useRef();

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setUsername("");
      setPassword("");
      setRecaptchaValue("");
      captchaRef.current.reset();
      navigate("/dash/users");
    }
  }, [isSuccess, navigate]);

  const onUsernameChanged = (e) => setUsername(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);

  const onRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const canSave =
    [validUsername, validPassword, recaptchaValue].every(Boolean) && !isLoading;

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({ username, password, recaptchaValue });
    }
    alert("Account Created");
  };

  const errClass = isError ? "errmsg" : "offscreen";
  const validUserClass = !validUsername ? "form__input--incomplete" : "";
  const validPwdClass = !validPassword ? "form__input--incomplete" : "";

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>

      <form className="form new-user-form" onSubmit={onSaveUserClicked}>
        <div className="form__title-row">
          <h2>New User</h2>
        </div>
        <label className="form__label" htmlFor="username">
          Username: <span className="nowrap">[3-20 letters]</span>
        </label>
        <input
          className={`form__input ${validUserClass}`}
          id="username"
          name="username"
          type="text"
          autoComplete="off"
          value={username}
          onChange={onUsernameChanged}
        />
        <label className="form__label" htmlFor="password">
          Password: <span className="nowrap">[8-20 chars incl. number]</span>
        </label>
        <input
          className={`form__input ${validPwdClass}`}
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={onPasswordChanged}
        />
        <div className="form__recaptcha">
          <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SECRET_KEY}
            onChange={onRecaptchaChange}
            ref={captchaRef}
          />
        </div>
        <button
          className="form__submit-button"
          type="submit"
          disabled={!canSave}
        >
          Create Account
        </button>
      </form>
    </>
  );

  return content;
};

export default NewUserForm;
