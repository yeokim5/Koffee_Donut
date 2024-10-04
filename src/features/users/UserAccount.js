import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetUserDataByUsernameQuery,
  useFollowUserMutation,
  useUnFollowUserMutation,
} from "./usersApiSlice";
import useAuth from "../../hooks/useAuth";
import { useGetNotesByUsernameQuery } from "../notes/notesApiSlice";
import Note from "../notes/Note";

const UserAccount = () => {
  /* reset scroll to prevent bug */
  // sessionStorage.setItem("scrollPosition", 0);
  // sessionStorage.removeItem("notesListState");

  const [followUser] = useFollowUserMutation();
  const [unFollowUser] = useUnFollowUserMutation();
  const { username: profileUsername } = useParams();
  const { username } = useAuth();
  const {
    data: profileUser,
    isLoading: userIsLoading,
    isError: userIsError,
  } = useGetUserDataByUsernameQuery(profileUsername);
  const {
    data: noteData,
    isLoading: noteLoading,
    isError: noteError,
  } = useGetNotesByUsernameQuery(profileUsername);

  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("recent");
  const notesPerPage = 5;

  const userNotes = noteData?.ids.map((id) => noteData.entities[id]) || [];

  const sortedNotes =
    view === "recent"
      ? [...userNotes].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      : userNotes;

  if (userIsLoading || noteLoading) return <div>Loading...</div>;
  if (userIsError || noteError) return <div>Error loading data</div>;
  if (!profileUser) return <div>User not found</div>;

  const { following, followers = [] } = profileUser;

  const handleFollow = async () => {
    if (!username) {
      alert("User needs to Login.");
      return;
    }
    try {
      await followUser(profileUsername).unwrap();
      window.location.reload();
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  const handleUnFollow = async () => {
    if (!username) {
      alert("User needs to Login.");
      return;
    }
    try {
      await unFollowUser(profileUsername).unwrap();
      window.location.reload();
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  };

  const isFollowing = profileUser.followers?.includes(username) || false;
  const isOwnProfile = username === profileUsername;

  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);
  const currentNotes = sortedNotes.slice(
    (currentPage - 1) * notesPerPage,
    currentPage * notesPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setCurrentPage(1);
  };

  return (
    <div className="account-container">
      <header className="account-header">
        <h1>{profileUsername}</h1>
        {!isOwnProfile && (
          <button
            className={`followButton ${isFollowing ? "unfollow" : "follow"}`}
            onClick={isFollowing ? handleUnFollow : handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </header>

      <div className="account-sections">
        <AccountSection title="Following" items={following} />
        <AccountSection title="Followers" items={followers} />
      </div>
      <section className="account-section">
        <h2>{profileUsername}'s Notes</h2>
        <div className="view-selector">
          <button
            onClick={() => handleViewChange("recent")}
            className={view === "recent" ? "active" : ""}
          >
            {profileUsername}'s Recent Notes
          </button>
        </div>
        <div className="note-list">
          {currentNotes.map((note) => (
            <Note key={note.id} noteId={note.id} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            {currentPage > 1 && (
              <button onClick={() => handlePageChange(currentPage - 1)}>
                Previous
              </button>
            )}
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            {currentPage < totalPages && (
              <button onClick={() => handlePageChange(currentPage + 1)}>
                Next
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const AccountSection = ({ title, items = [], renderItem = (item) => item }) => (
  <section className="account-section">
    <h2>{title}</h2>
    <ul className="account-list">
      {items.map((item, index) => (
        <li key={item.id || index} className="account-list-item">
          <Link to={`/dash/users/${renderItem(item)}`}>
            <span>{renderItem(item)}</span>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default UserAccount;
