import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faCaretUp,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useGetNotesQuery } from "./notesApiSlice";
import { memo, useEffect, useState } from "react";

const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const shortenTitle = (title, maxLength = 38) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
};
const shortenUsername = (title, maxLength = 13) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
};

// Helper functions for cookie management
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

const getCookie = (name) => {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
};

const Note = ({ noteId, trending }) => {
  const { note } = useGetNotesQuery("notesList", {
    selectFromResult: ({ data }) => ({
      note: data?.entities[noteId],
    }),
  });

  const navigate = useNavigate();
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    const visitedNotes = getCookie("visitedNotes");
    setIsVisited(visitedNotes.includes(noteId));
  }, [noteId]);

  if (note) {
    const createdDate = new Date(note.createdAt);
    const createdRelative = getRelativeTime(createdDate);

    const viewNote = () => {
      let visitedNotes = getCookie("visitedNotes");
      if (!visitedNotes.includes(noteId)) {
        visitedNotes += (visitedNotes ? "," : "") + noteId;
        setCookie("visitedNotes", visitedNotes, 1); // Set cookie to expire in 1 day
        setIsVisited(true);
      }
      navigate(`/dash/notes/${noteId}`);
    };

    const viewUserAccount = () =>
      navigate(`/dash/users/${note.username}`, {
        state: { username: note.username },
      });

    const linkStyle = {
      color: isVisited ? "rgb(75, 178, 215)" : "black",
      textDecoration: "none",
      cursor: "pointer",
    };

    // console.log(note.title, note.text);

    return (
      <div className="note-list-container">
        <div className="note-item">
          <div className="trending-section">
            <div className="trending-icon">
              {trending && <FontAwesomeIcon icon={faFire} />}
            </div>
          </div>
          <div className="list-like">
            <FontAwesomeIcon icon={faCaretUp} />
            {note.likes}
          </div>
          <div className="note-image-container">
            <div className="note-image">
              <img
                src="https://image.fmkorea.com/filesn/cache/thumbnails/20240713/095/771/245/007/70x50.crop.jpg?c=20240714002457"
                alt="Note"
              />
            </div>
          </div>
          <div className="note-content">
            <div className="note-title">
              <a onClick={viewNote} style={linkStyle}>
                {shortenTitle(note.title)}
              </a>
            </div>
            <div className="note-details">
              <div className="note-username">
                {createdRelative} /{" "}
                <a onClick={viewUserAccount}>
                  {shortenUsername(note.username)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else return null;
};

const memoizedNote = memo(Note);

export default memoizedNote;
