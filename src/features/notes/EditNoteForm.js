import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useLikeNoteMutation,
  useDislikeNoteMutation,
} from "./notesApiSlice";
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../comments/commentApiSlice";
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
import Comment from "../comments/Comment";
import { AlignCenter } from "lucide-react";

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
  const note_owner = useMemo(() => {
    if (userData && userData.entities && note.user) {
      return userData.entities[note.user] || { username: "Unknown User" };
    }
    return { username: "Unknown User" };
  }, [userData, note.user]);

  const userId = user?.id;
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
  const { data: commentsData, isLoading: isLoadingComments } =
    useGetCommentsQuery(note.id);
  const [addComment] = useAddCommentMutation();
  const [comments, setComments] = useState([]);
  const [displayedComments, setDisplayedComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 3;

  useEffect(() => {
    if (commentsData) {
      const sortedComments = [...commentsData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComments(sortedComments);
      setDisplayedComments(sortedComments.slice(0, commentsPerPage));
    }
  }, [commentsData]);

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setFormData({ title: "", editorContent: null, userId: "" });
      navigate("/");
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
      userId
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

  const noteObject = formData;
  const editorContent = noteObject.editorContent;
  const blocks = editorContent.blocks;

  const fileNames = blocks
    .filter((block) => block.type === "image")
    .map((block) => {
      const url = block.data.file.url;
      return url.split("/img/")[1];
    });

  const onDeleteNoteClicked = async () => {
    try {
      // First, delete the note
      await deleteNote({ id: note.id }).unwrap();

      // After successful note deletion, delete associated images if any exist
      if (fileNames.length > 0) {
        const response = await fetch(`http://localhost:3500/deleteImages`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileNames }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to delete associated images:", errorData.error);
        } else {
          console.log("Associated images deleted successfully");
        }
      } else {
        console.log("No associated images to delete");
      }
    } catch (err) {
      console.error("Failed to delete note or images:", err);
    }
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

    setLikeCount((prev) => prev + (liked ? -1 : 1) + (wasDisliked ? 1 : 0));

    try {
      await likeNote({ id: note.id, userId }).unwrap();
    } catch (err) {
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

    setLikeCount((prev) => prev - (disliked ? -1 : 1) - (wasLiked ? 1 : 0));

    try {
      await dislikeNote({ id: note.id, userId }).unwrap();
    } catch (err) {
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

  const handleAddComment = async () => {
    if (!username) {
      alert("User need to Login");
      return;
    }

    if (newCommentText.trim()) {
      try {
        const newComment = await addComment({
          noteId: note.id,
          text: newCommentText,
          username,
        }).unwrap();
        setComments((prevComments) => {
          const updatedComments = [newComment, ...prevComments].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          return updatedComments;
        });
        setDisplayedComments((prevDisplayed) => {
          const updatedDisplayed = [newComment, ...prevDisplayed]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, commentsPerPage);
          return updatedDisplayed;
        });
        setNewCommentText("");
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments((prevComments) => {
      const updatedComments = prevComments
        .map((comment) =>
          comment._id === updatedComment._id ? updatedComment : comment
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return updatedComments;
    });
    setDisplayedComments((prevDisplayed) => {
      const updatedDisplayed = prevDisplayed
        .map((comment) =>
          comment._id === updatedComment._id ? updatedComment : comment
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, commentsPerPage);
      return updatedDisplayed;
    });
  };

  const handleCommentDelete = (deletedCommentId) => {
    setComments((prevComments) => {
      const updatedComments = prevComments
        .filter((comment) => comment._id !== deletedCommentId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return updatedComments;
    });
    setDisplayedComments((prevDisplayed) => {
      const updatedDisplayed = prevDisplayed
        .filter((comment) => comment._id !== deletedCommentId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, commentsPerPage);
      return updatedDisplayed;
    });
  };

  const loadMoreComments = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const newComments = comments.slice(startIndex, endIndex);
    setDisplayedComments((prevDisplayed) => [...prevDisplayed, ...newComments]);
    setCurrentPage(nextPage);
  };

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

            <div className="comments__section">
              <h4>Comments ({comments.length})</h4>
              <div className="add-comment">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button onClick={handleAddComment}>Add Comment</button>
              </div>
              {isLoadingComments ? (
                <p>Loading comments...</p>
              ) : (
                <>
                  {displayedComments.map((comment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      noteId={note.id}
                      onCommentUpdate={handleCommentUpdate}
                      onCommentDelete={handleCommentDelete}
                    />
                  ))}
                  {comments.length > displayedComments.length ? (
                    <div
                      className="add-comment"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <button onClick={loadMoreComments}>
                        Load More Comments
                      </button>
                    </div>
                  ) : comments.length > 0 ? (
                    <p>END OF COMMENTS</p>
                  ) : (
                    <p>No comments yet</p>
                  )}
                </>
              )}
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
