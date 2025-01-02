import React, { useState, useCallback, useRef, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetNotesQuery,
  useGetTrendingNotesQuery,
  useGetFollowerNotesQuery,
} from "./notesApiSlice";
import Note from "./Note";
import { PulseLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";

// Constants
const NOTES_PER_PAGE = 10;
const SCROLL_RESTORE_DELAY = 100;
const STORAGE_KEYS = {
  STATE: "notesListState",
  SCROLL: "scrollPosition",
  VISITED: "visitedNotes",
};

// Memoized components
const LoadingIndicator = memo(() => (
  <p style={{ textAlign: "center" }}>
    <PulseLoader />
  </p>
));

const ViewSelector = memo(({ view, onViewChange, hasFollowing }) => (
  <div className="view-selector">
    {["recent", "trend", ...(hasFollowing ? ["following"] : [])].map(
      (viewOption) => (
        <button
          key={viewOption}
          onClick={() => onViewChange(viewOption)}
          className={view === viewOption ? "active" : ""}
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
      return JSON.parse(sessionStorage.getItem(key));
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
  remove: (key) => sessionStorage.removeItem(key),
};

// Main component
const NotesList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useAuth();

  // Refs
  const loadingRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isLoadingRef = useRef(false);
  const previousHeightRef = useRef(0);
  const observerRef = useRef(null);

  // State initialization with localStorage
  const [state, setState] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.STATE) || {};
    return {
      page: saved.page || 1,
      view: saved.view || "recent",
      allNotes: saved.allNotes || [],
    };
  });

  const { page, view, allNotes } = state;

  // Queries with optimized options
  const {
    data: notesData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery(
    { page, limit: NOTES_PER_PAGE },
    {
      skip: view !== "recent",
      refetchOnMountOrArgChange: false,
    }
  );

  const { data: trendingNotesData } = useGetTrendingNotesQuery(undefined, {
    skip: view !== "trend",
    refetchOnMountOrArgChange: false,
  });

  const { data: followingNotesData } = useGetFollowerNotesQuery(username, {
    skip: view !== "following" || !username,
    refetchOnMountOrArgChange: false,
  });

  // Add visited links state with sessionStorage persistence
  const [visitedNotes, setVisitedNotes] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.VISITED);
    return saved ? new Set(saved) : new Set();
  });

  // Memoized handlers
  const handleScroll = useCallback(() => {
    if (!isLoadingRef.current) {
      scrollPositionRef.current = window.scrollY;
      storage.set(STORAGE_KEYS.SCROLL, scrollPositionRef.current);
    }
  }, []);

  const handleViewChange = useCallback((newView) => {
    setState((prev) => ({
      ...prev,
      view: newView,
      page: 1,
      allNotes: [],
    }));
    window.scrollTo(0, 0);
    storage.remove(STORAGE_KEYS.SCROLL);
  }, []);

  const loadMoreNotes = useCallback(() => {
    if (
      !isLoading &&
      notesData?.totalPages &&
      page < notesData.totalPages &&
      view === "recent"
    ) {
      isLoadingRef.current = true;
      previousHeightRef.current = document.body.scrollHeight;
      setState((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [isLoading, notesData, page, view]);

  // Setup intersection observer
  React.useEffect(() => {
    if (loadingRef.current && view === "recent") {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMoreNotes();
        },
        { threshold: 0.5, rootMargin: "100px" }
      );

      observerRef.current.observe(loadingRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [loadMoreNotes, view]);

  // Save state
  React.useEffect(() => {
    const saveState = () => {
      storage.set(STORAGE_KEYS.STATE, { view, page, allNotes });
    };

    window.addEventListener("beforeunload", saveState);
    return () => {
      window.removeEventListener("beforeunload", saveState);
      saveState();
    };
  }, [view, page, allNotes]);

  // Scroll position management
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    const savedPosition = storage.get(STORAGE_KEYS.SCROLL);
    if (savedPosition !== null) {
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, SCROLL_RESTORE_DELAY);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location, handleScroll]);

  // Update notes data
  React.useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setState((prev) => {
        const newNotes = notesData.notes.ids.filter(
          (id) => !prev.allNotes.some((note) => note.id === id)
        );
        return {
          ...prev,
          allNotes: [...prev.allNotes, ...newNotes.map((id) => ({ id }))],
        };
      });

      // Adjust scroll position after update
      if (isLoadingRef.current) {
        requestAnimationFrame(() => {
          const heightDifference =
            document.body.scrollHeight - previousHeightRef.current;
          window.scrollTo(0, scrollPositionRef.current + heightDifference);
          isLoadingRef.current = false;
        });
      }
    }
  }, [isSuccess, notesData, view]);

  // Update note click handler
  const handleNoteClick = useCallback((noteId) => {
    setVisitedNotes((prev) => {
      const newSet = new Set(prev).add(noteId);
      storage.set(STORAGE_KEYS.VISITED, Array.from(newSet));
      return newSet;
    });
    storage.set(STORAGE_KEYS.SCROLL, scrollPositionRef.current);
  }, []);

  if (isError) return <p className="errmsg">{error?.data?.message}</p>;
  if (!isSuccess && view === "recent") return null;

  const noteIds = {
    recent: allNotes.map((note) => note.id),
    trend: trendingNotesData?.map((note) => note._id) || [],
    following: followingNotesData?.ids || [],
  }[view];

  return (
    <>
      <ViewSelector
        view={view}
        onViewChange={handleViewChange}
        hasFollowing={!!username}
      />
      <div className="notes-list">
        {noteIds.length ? (
          noteIds.map((id) => (
            <Note
              key={id}
              noteId={id}
              onClick={() => handleNoteClick(id)}
              className={visitedNotes.has(id) ? "visited-note" : ""}
            />
          ))
        ) : (
          <p>No {view} notes found</p>
        )}
        {view === "recent" && (
          <div ref={loadingRef}>
            {(isLoading || page < (notesData?.totalPages || 0)) && (
              <LoadingIndicator />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(NotesList);
