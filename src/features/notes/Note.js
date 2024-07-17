import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useGetNotesQuery } from "./notesApiSlice";
import { memo } from "react";

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

const Note = ({ noteId }) => {
  const { note } = useGetNotesQuery("notesList", {
    selectFromResult: ({ data }) => ({
      note: data?.entities[noteId],
    }),
  });

  const navigate = useNavigate();
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    const visitedNotes = JSON.parse(
      localStorage.getItem("visitedNotes") || "[]"
    );
    setIsVisited(visitedNotes.includes(noteId));

    // Set a timeout to remove the note from localStorage after 10 seconds
    const timer = setTimeout(() => {
      const updatedNotes = visitedNotes.filter((id) => id !== noteId);
      localStorage.setItem("visitedNotes", JSON.stringify(updatedNotes));
    }, 10000);

    // Clean up the timer on unmount
    return () => clearTimeout(timer);
  }, [noteId]);

  const viewNote = () => {
    navigate(`/dash/notes/${noteId}`);
    const visitedNotes = JSON.parse(
      localStorage.getItem("visitedNotes") || "[]"
    );
    if (!visitedNotes.includes(noteId)) {
      visitedNotes.push(noteId);
      localStorage.setItem("visitedNotes", JSON.stringify(visitedNotes));
      setIsVisited(true);
    }
  };

  const viewUserAccount = () =>
    navigate(`/dash/users/${note.username}`, {
      state: { username: note.username },
    });

  if (note) {
    const createdDate = new Date(note.createdAt);
    const createdRelative = getRelativeTime(createdDate);

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
                src="https://image.fmkorea.com/filesn/cache/thumbnails/20240713/095/771/245/007/70x50.crop.jpg?c=20240714002457"
                alt="Note"
              />
            </div>
          </div>
          <div className="note-content">
            <div className={`note-title ${isVisited ? "visited" : ""}`}>
              <a onClick={viewNote}>{shortenTitle(note.title)} </a>
            </div>
            <div className="note-details">
              <span className="note-username">
                {createdRelative} /{" "}
                <a onClick={viewUserAccount}>
                  {shortenUsername(note.username)}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  } else return null;
};

const memoizedNote = memo(Note);

export default memoizedNote;
