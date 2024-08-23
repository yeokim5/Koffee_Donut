import React from "react";
import { useGetNoteByIdQuery } from "./notesApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

// Helper functions for localStorage management
const setVisitedNotes = (value) => {
  localStorage.setItem("visitedNotes", JSON.stringify(value));
};

const getVisitedNotes = () => {
  const visitedNotes = localStorage.getItem("visitedNotes");
  return visitedNotes ? JSON.parse(visitedNotes) : [];
};
const Note = ({ noteId }) => {
  const {
    data: noteData,
    isLoading,
    isError,
    error,
  } = useGetNoteByIdQuery(noteId);

  const navigate = useNavigate();
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    const visitedNotes = getVisitedNotes();
    setIsVisited(visitedNotes.includes(noteId));
  }, [noteId]);

  if (isLoading) {
    return <PulseLoader color={"#FFF"} />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const note = noteData?.note;

  if (!note) {
    return <div>Note not found</div>;
  }

  const createdDate = new Date(note.createdAt);
  const createdRelative = getRelativeTime(createdDate);

  const viewNote = () => {
    let visitedNotes = getVisitedNotes();
    if (!visitedNotes.includes(noteId)) {
      visitedNotes.push(noteId);
      setVisitedNotes(visitedNotes);
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

  function extractImageUrl(jsonString) {
    // ... existing extractImageUrl function ...
  }

  return (
    <div className="note-list-container">
      <div className="note-item">
        <div className="list-like">
          <FontAwesomeIcon icon={faCaretUp} />
          {note.likes}
        </div>
        <div className="note-image-container">
          <div className="note-image">
            <img
              src={
                extractImageUrl(note.text) ||
                "https://koffee-donut.s3.amazonaws.com/no+image.png"
              }
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
              <a onClick={viewUserAccount}>{shortenUsername(note.username)}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;
