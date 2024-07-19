import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "./commentApiSlice";

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

const Comment = ({ comment, noteId, onCommentUpdate, onCommentDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const { username } = useAuth();

  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedComment = await updateComment({
        noteId,
        id: comment._id,
        text: editedText,
      }).unwrap();
      setIsEditing(false);
      onCommentUpdate(updatedComment);
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ noteId, id: comment._id }).unwrap();
      onCommentDelete(comment._id);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const createdRelative = getRelativeTime(new Date(comment.createdAt));

  return (
    <div className="comment">
      <div className="comment__header">
        <span className="comment__author">{comment.username}</span>
        <span className="comment__date">{createdRelative}</span>
      </div>
      {isEditing ? (
        <div className="comment__edit">
          <textarea
            className="comment__edit-textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
          <div className="comment__actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="comment__content">{comment.text}</p>
          {username === comment.username && (
            <div className="comment__actions">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Comment;
