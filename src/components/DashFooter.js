import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashFooter = () => {
  const { username, status, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onGoHomeClicked = async () => {
    if (!username) {
      alert("User need to Login");
    } else {
      navigate(`dash/users/${username}`);
    }
  };

  const onGoBackClicked = () => {
    navigate(-1);
  };

  const shouldShowGoBackButton = pathname !== "/";

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
      title="Go Back"
      onClick={onGoBackClicked}
    >
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
