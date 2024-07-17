import React, { useMemo, useState } from "react";
import { useGetNotesQuery } from "./notesApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import Note from "./Note";
import useAuth from "../../hooks/useAuth";

const NoteList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("recent");
  const notesPerPage = 10;
  const { username } = useAuth();

  const {
    data: notes,
    isLoading: isNotesLoading,
    isSuccess: isNotesSuccess,
    isError: isNotesError,
    error: notesError,
  } = useGetNotesQuery("notesList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    isSuccess: isUsersSuccess,
    isError: isUsersError,
    error: usersError,
  } = useGetUsersQuery();

  const currentUser = useMemo(() => {
    if (isUsersSuccess && username) {
      return Object.values(users.entities).find(
        (user) => user.username === username
      );
    }
    return null;
  }, [isUsersSuccess, users, username]);

  const sortedNoteIds = useMemo(() => {
    if (isNotesSuccess) {
      const noteIds = Object.keys(notes.entities);
      return noteIds.sort((a, b) => {
        const dateA = new Date(notes.entities[a].createdAt);
        const dateB = new Date(notes.entities[b].createdAt);
        return dateB - dateA;
      });
    }
    return [];
  }, [isNotesSuccess, notes]);

  const trendingNoteIds = useMemo(() => {
    if (isNotesSuccess) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
      return sortedNoteIds.filter((noteId) => {
        const note = notes.entities[noteId];
        const noteDate = new Date(note.createdAt);
        return note.likes >= 1 && noteDate > twentyFourHoursAgo;
      });
    }
    return [];
  }, [isNotesSuccess, notes, sortedNoteIds]);

  const followingNoteIds = useMemo(() => {
    if (isNotesSuccess && isUsersSuccess && currentUser) {
      return sortedNoteIds.filter((noteId) => {
        const note = notes.entities[noteId];
        const noteUser = Object.values(users.entities).find(
          (user) => user.id === note.user
        );
        return noteUser && currentUser.following.includes(noteUser.username);
      });
    }
    return [];
  }, [
    isNotesSuccess,
    isUsersSuccess,
    currentUser,
    notes,
    sortedNoteIds,
    users,
  ]);

  const getDisplayedNoteIds = () => {
    switch (view) {
      case "recent":
        return sortedNoteIds;
      case "trend":
        return trendingNoteIds;
      case "following":
        return followingNoteIds;
      default:
        return sortedNoteIds;
    }
  };

  const displayedNoteIds = getDisplayedNoteIds();
  const totalPages = Math.ceil(displayedNoteIds.length / notesPerPage);

  const currentNoteIds = displayedNoteIds.slice(
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

  let content;

  if (isNotesLoading || isUsersLoading) {
    content = <p>Loading...</p>;
  } else if (isNotesError || isUsersError) {
    content = (
      <p>Error: {notesError?.data?.message || usersError?.data?.message}</p>
    );
  } else if (isNotesSuccess && isUsersSuccess) {
    content = (
      <div className="note-list-container">
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
            Trend
          </button>
          {username && (
            <button
              onClick={() => handleViewChange("following")}
              className={view === "following" ? "active" : ""}
            >
              Following
            </button>
          )}
        </div>
        <div className="note-list">
          {currentNoteIds.map((noteId) => (
            <Note key={noteId} noteId={noteId} />
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
      </div>
    );
  }

  return content;
};

export default NoteList;
