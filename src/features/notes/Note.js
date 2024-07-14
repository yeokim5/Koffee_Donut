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

const Note = ({ noteId }) => {
  const { note } = useGetNotesQuery("notesList", {
    selectFromResult: ({ data }) => ({
      note: data?.entities[noteId],
    }),
  });

  const navigate = useNavigate();

  if (note) {
    const createdDate = new Date(note.createdAt);
    const updatedDate = new Date(note.updatedAt);
    const createdRelative = getRelativeTime(createdDate);
    const updatedRelative = getRelativeTime(updatedDate);

    const viewNote = () => navigate(`/dash/notes/${noteId}`);

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
          <div className="note-content" onClick={viewNote}>
            <div className="note-title">
              <a>{note.title}</a>
            </div>
            <div className="note-details">
              <span className="note-username">
                {createdRelative} / {note.username}
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
