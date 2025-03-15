import React, { useState, useCallback, useRef, memo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useGetNotesQuery,
  useGetTrendingNotesQuery,
  useGetFollowerNotesQuery,
} from "./notesApiSlice";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import Note from "./Note";
import { PulseLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";

// Constants
const NOTES_PER_PAGE = 10;
const STORAGE_KEYS = {
  STATE: "notesListState",
  SCROLL: "scrollPosition",
};

// Memoized components
const LoadingIndicator = memo(() => (
  <div style={{ textAlign: "center", padding: "20px" }}>
    <PulseLoader />
  </div>
));

const ViewSelector = memo(({ view, onViewChange, hasFollowing }) => (
  <div className="view-selector">
    {["recent", "trend", ...(hasFollowing ? ["following"] : [])].map(
      (viewOption) => (
        <button
          key={viewOption}
          onClick={() => onViewChange(viewOption)}
          className={view === viewOption ? "active" : ""}
          style={{ cursor: "pointer" }}
        >
          {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
        </button>
      )
    )}
  </div>
));

// Storage utility
const storage = {
  get: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save to sessionStorage: ${key}`, e);
    }
  },
  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove from sessionStorage: ${key}`, e);
    }
  },
};

const NotesList = () => {
  const location = useLocation();
  const { username } = useAuth();
  const { saveScrollPosition, restoreScrollPosition } = useScrollPosition();
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  const [state, setState] = useState(() => {
    const savedState = storage.get(STORAGE_KEYS.STATE);
    return savedState && savedState.recent
      ? savedState
      : {
          view: "recent",
          recent: { page: 1, notes: [], hasMore: true },
          trend: { notes: [] },
          following: { notes: [] },
        };
  });
  

  const { view } = state;

  // Queries
  const {
    data: notesData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery(
    { page: state.recent.page, limit: NOTES_PER_PAGE },
    {
      skip: view !== "recent",
    }
  );

  const { 
    data: trendingNotesData,
    isLoading: trendLoading 
  } = useGetTrendingNotesQuery(undefined, {
    skip: view !== "trend",
  });

  const { 
    data: followingNotesData,
    isLoading: followingLoading 
  } = useGetFollowerNotesQuery(username, {
    skip: view !== "following" || !username,
  });

  // Restore scroll position
  useEffect(() => {
    const savedScroll = storage.get(STORAGE_KEYS.SCROLL);
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScroll);
      });
    }
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (view !== "recent" || !loadMoreRef.current || isLoading || !state.recent.hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.recent.hasMore && !isFetching) {
          setState(prev => ({
            ...prev,
            recent: {
              ...prev.recent,
              page: prev.recent.page + 1
            }
          }));
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [view, isLoading, isFetching, state.recent.hasMore]);

  // Update notes when new data arrives
  useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setState(prev => ({
        ...prev,
        recent: {
          ...prev.recent,
          notes: prev.recent.page === 1 
            ? notesData.notes 
            : [...prev.recent.notes, ...notesData.notes.filter(n => 
                !prev.recent.notes.some(existing => existing.id === n.id)
              )],
          hasMore: notesData.currentPage < notesData.totalPages,
        }
      }));
    }
  }, [notesData, isSuccess, view]);

  // Update trending and following notes
  useEffect(() => {
    if (trendingNotesData && view === "trend") {
      setState(prev => ({
        ...prev,
        trend: { notes: trendingNotesData }
      }));
    }
    if (followingNotesData && view === "following") {
      setState(prev => ({
        ...prev,
        following: { notes: followingNotesData }
      }));
    }
  }, [trendingNotesData, followingNotesData, view]);

  // Handlers
  const handleViewChange = useCallback((newView) => {
    setState(prev => ({
      ...prev,
      view: newView,
      recent: newView === "recent" ? { ...prev.recent, page: 1, notes: [] } : prev.recent
    }));
    window.scrollTo(0, 0);
  }, []);

  const handleNoteClick = useCallback(() => {
    saveScrollPosition(window.scrollY);
  }, [saveScrollPosition]);

  // Save state before unload
  useEffect(() => {
    const saveState = () => {
      storage.set(STORAGE_KEYS.STATE, state);
    };
    window.addEventListener("beforeunload", saveState);
    return () => {
      window.removeEventListener("beforeunload", saveState);
      saveState();
    };
  }, [state]);

  if (isError) return <p className="errmsg">{error?.data?.message}</p>;

  const notesToShow = {
    recent: state.recent.notes,
    trend: state.trend.notes,
    following: state.following.notes
  }[view] || [];

  const isViewLoading = {
    recent: isLoading,
    trend: trendLoading,
    following: followingLoading
  }[view];

  return (
    <>
      <ViewSelector
        view={view}
        onViewChange={handleViewChange}
        hasFollowing={!!username}
      />
      <div className="notes-list">
        {isViewLoading && !notesToShow.length ? (
          <LoadingIndicator />
        ) : notesToShow.length ? (
          notesToShow.map((note) => (
            <Note 
              key={note.id || note._id} 
              noteId={note.id || note._id} 
              onClick={handleNoteClick}
            />
          ))
        ) : (
          <p>No {view} notes found</p>
        )}
        {view === "recent" && state.recent.hasMore && (
          <div ref={loadMoreRef}>
            {isFetching && <LoadingIndicator />}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(NotesList);