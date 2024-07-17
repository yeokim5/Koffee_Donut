import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useLikeNoteMutation,
  useDislikeNoteMutation,
} from "./notesApiSlice";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTrashCan,
  faPenToSquare,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import EditorComponent from "./EditorComponent";
import { useGetUsersQuery } from "../users/usersApiSlice";

const EditNoteForm = ({ note, users }) => {
  const { username } = useAuth();
  const [updateNote, { isLoading, isSuccess, isError, error }] =
    useUpdateNoteMutation();
  const [
    deleteNote,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteNoteMutation();
  const [likeNote] = useLikeNoteMutation();
  const [dislikeNote] = useDislikeNoteMutation();
  const navigate = useNavigate();
  const { data: userData, isLoading: isUserDataLoading } = useGetUsersQuery();

  const user = users.find((user) => user.username === username);
  console.log(note.user);
  console.log(userData);
  const note_owner = useMemo(() => {
    if (userData && userData.entities && note.user) {
      return userData.entities[note.user] || { username: "Unknown User" };
    }
    return { username: "Unknown User" };
  }, [userData, note.user]);

  const userId = user?.id; // Use optional chaining to handle case when user is not found
  const [formData, setFormData] = useState({
    title: note.title,
    editorContent: JSON.parse(note.text),
    completed: note.completed,
    userId: note.user,
  });
  const [editMode, setEditMode] = useState(false);

  const [liked, setLiked] = useState(note.likedBy.includes(userId));
  const [disliked, setDisliked] = useState(note.dislikedBy.includes(userId));
  const [likeCount, setLikeCount] = useState(note.likes);

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setFormData({ title: "", editorContent: null, userId: "" });
      navigate("/dash/notes");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleEditorChange = useCallback((content) => {
    setFormData((prev) => ({ ...prev, editorContent: content }));
  }, []);

  const canSave = useMemo(() => {
    return (
      [formData.title, formData.editorContent, formData.userId].every(
        Boolean
      ) &&
      !isLoading &&
      userId // Add userId check here
    );
  }, [formData, isLoading, userId]);

  const onSaveNoteClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await updateNote({
        id: note.id,
        user: userId,
        title: formData.title,
        text: JSON.stringify(formData.editorContent),
        completed: formData.completed,
      });
    }
  };

  const onDeleteNoteClicked = async () => {
    await deleteNote({ id: note.id });
  };

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  const errContent = (error?.data?.message || delerror?.data?.message) ?? "";
  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const validTitleClass = !formData.title ? "form__input--incomplete" : "";

  const onLikeClicked = async () => {
    if (!userId) {
      alert("User need to Login");
      return;
    }

    const wasDisliked = disliked;
    setLiked(!liked);
    if (disliked) setDisliked(false);

    // Optimistic update
    setLikeCount((prev) => prev + (liked ? -1 : 1) + (wasDisliked ? 1 : 0));

    try {
      await likeNote({ id: note.id, userId }).unwrap();
    } catch (err) {
      // Revert optimistic update on error
      setLiked(liked);
      if (wasDisliked) setDisliked(true);
      setLikeCount(note.likes);
      console.error("Failed to update like status:", err);
    }
  };

  const onDislikeClicked = async () => {
    if (!userId) {
      alert("User need to Login");
      return;
    }

    const wasLiked = liked;
    setDisliked(!disliked);
    if (liked) setLiked(false);

    // Optimistic update
    setLikeCount((prev) => prev - (disliked ? -1 : 1) - (wasLiked ? 1 : 0));

    try {
      await dislikeNote({ id: note.id, userId }).unwrap();
    } catch (err) {
      // Revert optimistic update on error
      setDisliked(disliked);
      if (wasLiked) setLiked(true);
      setLikeCount(note.likes);
      console.error("Failed to update dislike status:", err);
    }
  };

  const getBackgroundColor = () => {
    if (liked) return "skyblue";
    if (disliked) return "rgb(246, 115, 115)";
    return "white";
  };

  const renderButtons = () => (
    <div className="form__action-buttons">
      {username === note.username && !editMode && (
        <button className="icon-button" onClick={toggleEditMode}>
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      )}
      {editMode && (
        <>
          <button
            className="icon-button"
            title="Save"
            onClick={onSaveNoteClicked}
            disabled={!canSave}
          >
            <FontAwesomeIcon icon={faSave} />
          </button>
          <button
            className="icon-button"
            title="Delete"
            onClick={onDeleteNoteClicked}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <p className={errClass}>{errContent}</p>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__title-row">{renderButtons()}</div>
        {editMode ? (
          <>
            <h2>Edit Note</h2>
            <label className="form__label" htmlFor="note-title">
              Title:
            </label>
            <input
              className={`form__input ${validTitleClass}`}
              id="note-title"
              name="title"
              type="text"
              autoComplete="off"
              value={formData.title}
              onChange={handleInputChange}
            />
            <label className="form__label" htmlFor="note-text">
              Content:
            </label>
          </>
        ) : (
          <>
            <h3>{formData.title}</h3>
            <h5>
              {isUserDataLoading ? (
                "Loading user data..."
              ) : (
                <Link to={`/dash/users/${note_owner.username}`}>
                  {note_owner.username}
                </Link>
              )}
            </h5>
          </>
        )}
        {formData.editorContent ? (
          <>
            <EditorComponent
              onChange={handleEditorChange}
              initialData={formData.editorContent}
              readMode={!editMode}
            />

            <div className="like__section">
              <div
                className="like__components"
                style={{ backgroundColor: getBackgroundColor() }}
              >
                <button
                  className="like-button like"
                  title="Like"
                  onClick={onLikeClicked}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                </button>
                <p className="like-count">
                  <span>{likeCount}</span>
                </p>
                <button
                  className="like-button dislike"
                  title="Dislike"
                  onClick={onDislikeClicked}
                >
                  <FontAwesomeIcon icon={faCaretDown} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Error loading note content. Please check console for details.</p>
        )}
      </form>
    </>
  );
};

export default EditNoteForm;
