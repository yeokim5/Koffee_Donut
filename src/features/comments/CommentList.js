import React, { useState } from "react";
import { useGetCommentsQuery, useAddCommentMutation } from "./commentsApiSlice";
import Comment from "./Comment";
import useAuth from "../../hooks/useAuth";

const CommentList = ({ noteId }) => {
  const { username } = useAuth();
  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useGetCommentsQuery(noteId);
  const [addComment] = useAddCommentMutation();
  const [newCommentText, setNewCommentText] = useState("");

  const handleAddComment = async () => {
    if (newCommentText.trim()) {
      await addComment({ noteId, text: newCommentText, username });
      setNewCommentText("");
    }
  };

  if (isLoading) return <div>Loading comments...</div>;
  if (isError) return <div>Error loading comments: {error.message}</div>;

  return (
    <div className="comment-list">
      <h3>Comments</h3>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} noteId={noteId} />
      ))}
      <div className="add-comment">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default CommentList;
