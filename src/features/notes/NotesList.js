import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useGetNotesQuery } from "./notesApiSlice";
import { useGetUsersQuery } from "../users/usersApiSlice";
import Note from "./Note";
import useAuth from "../../hooks/useAuth";
import { useInView } from "react-intersection-observer";
import BeatLoader from "react-spinners/BeatLoader";

const NOTES_PER_PAGE = 10;

const NoteList = () => {
  const [view, setView] = useState("recent");
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { username } = useAuth();
  const { ref, inView } = useInView();

  const {
    data: notes,
    isLoading: isNotesLoading,
    isSuccess: isNotesSuccess,
    isError: isNotesError,
    error: notesError,
  } = useGetNotesQuery("notesList");

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

  const trendingNoteIdsRecent = useMemo(() => {
    if (isNotesSuccess) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
      const recentPopularNotes = sortedNoteIds
        .filter((noteId) => {
          const note = notes.entities[noteId];
          const noteDate = new Date(note.createdAt);
          return noteDate > twentyFourHoursAgo;
        })
        .sort((a, b) => notes.entities[b].likes - notes.entities[a].likes)
        .slice(0, 10);

      const selectedTrendingNotes = [];
      while (
        selectedTrendingNotes.length < 3 &&
        recentPopularNotes.length > 0
      ) {
        const randomIndex = Math.floor(
          Math.random() * recentPopularNotes.length
        );
        selectedTrendingNotes.push(
          recentPopularNotes.splice(randomIndex, 1)[0]
        );
      }
      return selectedTrendingNotes;
    }
    return [];
  }, [isNotesSuccess, notes, sortedNoteIds]);

  const trendingNoteIdsTrending = useMemo(() => {
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

  const getDisplayedNoteIds = useCallback(() => {
    switch (view) {
      case "recent":
        return sortedNoteIds;
      case "trend":
        return trendingNoteIdsTrending;
      case "following":
        return followingNoteIds;
      default:
        return sortedNoteIds;
    }
  }, [view, sortedNoteIds, trendingNoteIdsTrending, followingNoteIds]);

  useEffect(() => {
    const noteIds = getDisplayedNoteIds();
    const newDisplayedNotes = noteIds.slice(0, page * NOTES_PER_PAGE);
    setDisplayedNotes(newDisplayedNotes);
    setHasMore(newDisplayedNotes.length < noteIds.length);
  }, [getDisplayedNoteIds, page]);

  useEffect(() => {
    if (inView && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setPage((prevPage) => prevPage + 1);
        setIsLoadingMore(false);
      }, 1000);
    }
  }, [inView, isLoadingMore, hasMore]);

  const handleViewChange = (newView) => {
    setView(newView);
    setPage(1);
    setDisplayedNotes([]);
    setHasMore(true);
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
            Trending
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

        {view === "recent" && (
          <div className="trending-notes">
            {trendingNoteIdsRecent.map((noteId) => (
              <Note key={noteId} noteId={noteId} trending={true} />
            ))}
          </div>
        )}

        <div className="note-list">
          {displayedNotes.map((noteId) => (
            <Note key={noteId} noteId={noteId} />
          ))}
        </div>
        <div ref={ref}>
          {isLoadingMore && hasMore && (
            <div className="loader-container">
              <BeatLoader size={10} color="#b4b4b4" />
            </div>
          )}
          {!hasMore && <p>No more notes to load.</p>}
        </div>
      </div>
    );
  }

  return content;
};

export default NoteList;
