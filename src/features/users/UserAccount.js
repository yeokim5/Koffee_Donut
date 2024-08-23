import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  useGetUsersQuery,
  useFollowUserMutation,
  useUnFollowUserMutation,
} from "./usersApiSlice";
import useAuth from "../../hooks/useAuth";
import { useGetNotesByUsernameQuery } from "../notes/notesApiSlice";
import Note from "../notes/Note";

const UserAccount = () => {
  const [followUser] = useFollowUserMutation();
  const [unFollowUser] = useUnFollowUserMutation();
  const { data: userData, isLoading, isError } = useGetUsersQuery();
  const { username: profileUsername } = useParams();
  const { username } = useAuth();
  const {
    data: noteData,
    isLoading: noteLoading,
    isError: noteError,
  } = useGetNotesByUsernameQuery(profileUsername);
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("recent");
  const notesPerPage = 5;

  const findUserByUsername = useMemo(() => {
    return (users, targetUsername) =>
      users
        ? Object.values(users.entities).find(
            (user) => user.username === targetUsername
          )
        : null;
  }, []);

  const currentUser = useMemo(
    () => (userData ? findUserByUsername(userData, username) : null),
    [userData, username, findUserByUsername]
  );

  const profileUser = useMemo(
    () => (userData ? findUserByUsername(userData, profileUsername) : null),
    [userData, profileUsername, findUserByUsername]
  );

  const userNotes = useMemo(() => {
    if (noteData && noteData.ids) {
      return noteData.ids.map((id) => noteData.entities[id]);
    }
    return [];
  }, [noteData]);

  const sortedNotes = useMemo(() => {
    if (view === "recent") {
      return [...userNotes].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (view === "trend") {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
      return userNotes
        .filter(
          (note) =>
            new Date(note.createdAt) > twentyFourHoursAgo && note.likes >= 1
        )
        .sort((a, b) => b.likes - a.likes);
    }
    return userNotes;
  }, [userNotes, view]);

  if (isLoading || noteLoading) return <div>Loading...</div>;
  if (isError || noteError) return <div>Error loading data</div>;
  if (!profileUser) return <div>User not found</div>;

  const following = profileUser.following;
  const followers = profileUser.followers || [];

  const handleFollow = async () => {
    if (!username) {
      alert("User needs to Login.");
      return;
    }
    try {
      await followUser(profileUsername).unwrap();
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
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  };
  const isFollowing =
    currentUser?.following?.includes(profileUsername) || false;
  const isOwnProfile = currentUser?.username === profileUsername;

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
            Recent
          </button>
          <button
            onClick={() => handleViewChange("trend")}
            className={view === "trend" ? "active" : ""}
          >
            {profileUsername}'s Trending Note
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
