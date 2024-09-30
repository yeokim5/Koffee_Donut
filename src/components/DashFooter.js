import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashFooter = () => {
  const { username, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onGoHomeClicked = async () => {
    if (!username) {
      alert("User needs to Login");
    } else {
      navigate(`/dash/users/${username}`);
    }
  };

  const onGoBackClicked = () => {
    window.close();
  };

  const shouldShowGoBackButton = /^\/dash\/notes\/[a-zA-Z0-9]+$/.test(pathname);

  let goHomeButton = (
    <button
      className="dash-footer__button icon-button"
      title="Home"
      onClick={onGoHomeClicked}
    >
      <FontAwesomeIcon icon={faUser} />
    </button>
  );

  let goBackButton = shouldShowGoBackButton ? (
    <button
      className="dash-footer__button icon-button go-back"
      title="Close"
      onClick={onGoBackClicked}
    >
      <p>Close</p>
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
  ) : null;

  const content = (
    <footer className="dash-footer">
      {goHomeButton}
      {isAuthenticated ? (
        <p>Current User: {username}</p>
      ) : (
        <p>Current User: Not Logged In</p>
      )}
      <Link to="/about">
        <p>About</p>
      </Link>
      {goBackButton}
    </footer>
  );
  return content;
};

export default DashFooter;
