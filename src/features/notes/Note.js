import React, { memo, useCallback, useMemo } from "react";
import { LuEye } from "react-icons/lu";
import { useGetNoteByIdQuery } from "./notesApiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

// Moved outside component to prevent recreation
const DEFAULT_IMAGE = "https://koffee-donut.s3.amazonaws.com/no+image.png";

// Utility functions
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const shortenText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

// Main component
const Note = memo(({ noteId }) => {
  const navigate = useNavigate();

  // Optimize query with specific fields selection
  const {
    data: noteData,
    isError,
    error,
  } = useGetNoteByIdQuery(noteId, {
    selectFromResult: ({ data, isError, error }) => ({
      data: data?.note,
      isError,
      error,
    }),
    refetchOnMountOrArgChange: false, // Prevent unnecessary refetches
  });

  // Memoize event handler
  const viewNote = useCallback(() => {
    navigate(`/dash/notes/${noteId}`);
  }, [noteId, navigate]);

  // Memoize derived data before early return
  const createdRelative = useMemo(
    () => (noteData ? getRelativeTime(noteData.createdAt) : ""),
    [noteData?.createdAt]
  );

  const shortTitle = useMemo(
    () => (noteData ? shortenText(noteData.title, 90) : ""),
    [noteData?.title]
  );

  const shortUsername = useMemo(
    () => (noteData ? shortenText(noteData.username, 13) : ""),
    [noteData?.username]
  );

  // Early return for error states
  if (isError) return <div>Error: {error.message}</div>;
  if (!noteData) return null;

  return (
    <div className="note-list-container">
      <div className="note-item">
        <div className="list-like">
          <FontAwesomeIcon icon={faCaretUp} />
          {noteData.likes}
        </div>

        <div className="note-image-container">
          <div className="note-image">
            {/* Optimized image loading */}
            <img
              src={noteData.imageURL || DEFAULT_IMAGE}
              alt={shortTitle}
              loading="lazy"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>
        </div>

        <div onClick={viewNote} className="note-content">
          <div className="note-title">
            <a>{shortTitle}</a>
          </div>
          <div className="note-details">
            <div className="note-username">
              {shortUsername}
              &nbsp;/&nbsp;
              {createdRelative}
              <span className="icon-text">
                &nbsp;&nbsp;&nbsp;&nbsp;
                <LuEye />
                &nbsp;&nbsp;
              </span>
              {noteData.views}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Note.displayName = "Note";

export default Note;
