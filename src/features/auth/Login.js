import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { useLoginMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import useTitle from "../../hooks/useTitle";
import PulseLoader from "react-spinners/PulseLoader";
import OAuth from "../../components/OAuth";

const Login = () => {
  useTitle("Login");

  // const userRef = useRef();
  const errRef = useRef();
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  // const [persist, setPersist] = usePersist();

  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  // const [login, { isLoading }] = useLoginMutation();

  // useEffect(() => {
  //   userRef.current.focus();
  // }, []);

  // useEffect(() => {
  //   setErrMsg("");
  // }, [username, password]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const { accessToken } = await login({ username, password }).unwrap();
  //     sessionStorage.removeItem("notesListState");
  //     sessionStorage.removeItem("scrollPosition");
  //     dispatch(setCredentials({ accessToken }));
  //     setUsername("");
  //     setPassword("");
  //     navigate("/");
  //     sessionStorage.removeItem("notesListState");
  //   } catch (err) {
  //     if (!err.status) {
  //       setErrMsg("No Server Response");
  //     } else if (err.status === 400) {
  //       setErrMsg("Missing Username or Password");
  //     } else if (err.status === 401) {
  //       setErrMsg("Unauthorized");
  //     } else {
  //       setErrMsg(err.data?.message);
  //     }
  //     errRef.current.focus();
  //   }
  // };

  // const handleUserInput = (e) => setUsername(e.target.value);
  // const handlePwdInput = (e) => setPassword(e.target.value);
  // const handleToggle = () => setPersist((prev) => !prev);

  const errClass =
    errMsg && !errMsg.includes("popup-closed-by-user") ? "errmsg" : "offscreen";

  // if (isLoading) return <PulseLoader color={"#FFF"} />;

  const content = (
    <section className="public">
      <main className="login">
        <div className="login-container">
          <p ref={errRef} className={errClass} aria-live="assertive">
            {errMsg}
          </p>

          <h1 className="login-title">Welcome To Koffee Donut</h1>
          <p className="login-subtitle">Sign in to continue to your account</p>

          <div className="login-button-container">
            <OAuth setErrMsg={setErrMsg} />
          </div>
        </div>
      </main>
    </section>
  );

  return content;
};

export default Login;
