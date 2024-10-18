import React from "react";
import { LuEye } from "react-icons/lu";
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

const shortenTitle = (title, maxLength = 90) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
};
const shortenUsername = (title, maxLength = 13) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
};

// Helper functions for localStorage management
const setVisitedNotes = (value) => {
  const data = {
    notes: value,
    timestamp: Date.now(),
  };
  localStorage.setItem("visitedNotes", JSON.stringify(data));
};

const getVisitedNotes = () => {
  const visitedNotesData = localStorage.getItem("visitedNotes");
  if (visitedNotesData) {
    const { notes, timestamp } = JSON.parse(visitedNotesData);
    const now = Date.now();
    const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

    if (hoursPassed < 2) {
      return notes;
    } else {
      localStorage.removeItem("visitedNotes");
    }
  }
  return [];
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

  const viewUserAccount = (event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the parent
    navigate(`/dash/users/${note.username}`, {
      state: { username: note.username },
    });
  };

  const linkStyle = {
    color: isVisited ? "rgb(75, 178, 215)" : "black",
    textDecoration: "none",
    cursor: "pointer",
  };

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
                note.imageURL ||
                "https://koffee-donut.s3.amazonaws.com/no+image.png"
              }
              alt="Note"
            />
          </div>
        </div>
        <div onClick={viewNote} className="note-content">
          <div className="note-title">
            <a style={linkStyle}>{shortenTitle(note.title)}</a>
          </div>
          <div className="note-details">
            <div className="note-username">
              <a onClick={viewUserAccount} style={{ cursor: "pointer" }}>
                {shortenUsername(note.username)}
              </a>
              &nbsp;/&nbsp;
              {createdRelative}
              <span className="icon-text">
                &nbsp;&nbsp;&nbsp;&nbsp;
                <LuEye />
                &nbsp;&nbsp;
              </span>
              {note.views}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;
