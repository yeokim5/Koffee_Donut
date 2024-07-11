import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUpdateNoteMutation, useDeleteNoteMutation } from "./notesApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTrashCan,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import EditorComponent from "./EditorComponent";

const EditNoteForm = ({ note, users }) => {
  const { username } = useAuth();
  const [updateNote, { isLoading, isSuccess, isError, error }] =
    useUpdateNoteMutation();
  const [
    deleteNote,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteNoteMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: note.title,
    editorContent: JSON.parse(note.text),
    completed: note.completed,
    userId: note.user,
  });
  const [editMode, setEditMode] = useState(false);

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
      ) && !isLoading
    );
  }, [formData, isLoading]);

  const onSaveNoteClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await updateNote({
        id: note.id,
        user: formData.userId,
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
            <label className="form__label" htmlFor="note-title">
              Title:
              <input
                className={`form__input ${validTitleClass}`}
                id="note-title"
                name="title"
                type="text"
                autoComplete="off"
                value={formData.title}
                onChange={handleInputChange}
              />
            </label>
            <label className="form__label" htmlFor="note-text">
              Content:
            </label>
          </>
        ) : (
          <h3>{formData.title}</h3>
        )}
        {formData.editorContent ? (
          <EditorComponent
            onChange={handleEditorChange}
            initialData={formData.editorContent}
            readMode={!editMode}
          />
        ) : (
          <p>Error loading note content. Please check console for details.</p>
        )}
        <div className="form__row">
          <div className="form__divider">
            <label
              className="form__label form__checkbox-container"
              htmlFor="note-completed"
            >
              WORK COMPLETE:
              <input
                className="form__checkbox"
                id="note-completed"
                name="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={handleInputChange}
              />
            </label>
            <label
              className="form__label form__checkbox-container"
              htmlFor="note-username"
            >
              ASSIGNED TO:
              <select
                id="note-username"
                name="userId"
                className="form__select"
                value={formData.userId}
                onChange={handleInputChange}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form__divider">
            <p className="form__created">
              Created:
              <br />
              {formatDate(note.createdAt)}
            </p>
            <p className="form__updated">
              Updated:
              <br />
              {formatDate(note.updatedAt)}
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditNoteForm;
