import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
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

  let goHomeButton = null;
  goHomeButton = (
    <button
      className="dash-footer__button icon-button"
      title="Home"
      onClick={onGoHomeClicked}
    >
      <FontAwesomeIcon icon={faUser} />
    </button>
  );

  const content = (
    <footer className="dash-footer">
      {goHomeButton}

      {isAuthenticated ? (
        <p>Current User: {username}</p>
      ) : (
        <p>Current User: Not Logged In</p>
      )}
      <Link to="/about">What is Koffee Donut?(Click)</Link>
    </footer>
  );
  return content;
};
export default DashFooter;
