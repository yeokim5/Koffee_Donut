import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewNoteMutation } from "./notesApiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import EditorComponent from "./EditorComponent";
import { imageExtracter } from "../../features/image/imageExtracter";
import { GoQuestion } from "react-icons/go";
import HelpPopup from "./HelpPopup";

const NewNoteForm = ({ user }) => {
  const [addNewNote, { isLoading, isSuccess, isError, error }] =
    useAddNewNoteMutation();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      localStorage.setItem("pendingImage", JSON.stringify([]));
      sessionStorage.removeItem("notesListState");
      setTitle("");
      setEditorContent(null);
      navigate("/");
      window.location.reload();
    }
  }, [isSuccess, navigate]);

  const onTitleChanged = (e) => setTitle(e.target.value);

  const handleEditorChange = useCallback((content) => {
    setEditorContent(content);
  }, []);

  const canSave = [title, editorContent, user?.id].every(Boolean) && !isLoading;

  const onSaveNoteClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      let imageUrl;
      if (editorContent) {
        try {
          imageUrl = await imageExtracter(JSON.stringify(editorContent));
        } catch (error) {
          console.error("Error extracting image URL:", error);
        }
      }

      await addNewNote({
        user: user.id,
        title,
        text: JSON.stringify(editorContent),
        imageURL: imageUrl,
      });
    }
  };

  const errClass = isError ? "errmsg" : "offscreen";
  const validTitleClass = !title ? "form__input--incomplete" : "";

  return (
    <>
      <p className={errClass}>{error?.data?.message}</p>
      <form className="form" onSubmit={onSaveNoteClicked}>
        <div className="form__title-row">
          <h2>
            New Note{" "}
            <GoQuestion
              className="GoQuestion"
              onClick={() => setIsHelpOpen(true)}
              style={{ cursor: "pointer" }}
            />
          </h2>
          <div className="form__action-buttons">
            <button className="icon-button" title="Save" disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>
        <label className="form__label" htmlFor="title">
          Title
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          onChange={onTitleChanged}
        />
        <label className="form__label" htmlFor="content">
          Content:
        </label>
        <EditorComponent onChange={handleEditorChange} />
      </form>
      <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default NewNoteForm;
