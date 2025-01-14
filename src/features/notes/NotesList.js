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

// Constants remain the same
const NOTES_PER_PAGE = 10;
const STORAGE_KEYS = {
  STATE: "notesListState",
  SCROLL: "scrollPosition",
};

// Memoized components remain the same
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
          onClick={() => viewOption !== view && onViewChange(viewOption)}
          className={view === viewOption ? "active" : ""}
          disabled={view === viewOption}
          style={{ cursor: view === viewOption ? "default" : "pointer" }}
        >
          {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
        </button>
      )
    )}
  </div>
));

// Storage utility remains the same
const storage = {
  get: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      if (parsed && typeof parsed === "object") {
        if (parsed.page && typeof parsed.page === "number") {
          return parsed;
        }
      }
      sessionStorage.removeItem(key);
      return null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (
        value &&
        typeof value === "object" &&
        value.page &&
        typeof value.page === "number"
      ) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
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

  // Add returning from note flag
  const isReturningFromNote = useRef(false);

  // Refs for infinite scroll
  const loadingRef = useRef(null);
  const isLoadingRef = useRef(false);
  const observerRef = useRef(null);

  const [state, setState] = useState(() => {
    // Try to restore previous state on mount
    const savedState = storage.get(STORAGE_KEYS.STATE);
    return (
      savedState || {
        page: 1,
        view: "recent",
        allNotes: [],
        hasMore: true,
      }
    );
  });

  const { page, view, allNotes, hasMore } = state;

  // Queries remain the same
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

  // Handle returning from note view
  useEffect(() => {
    if (isReturningFromNote.current) {
      requestAnimationFrame(() => {
        restoreScrollPosition();
        isReturningFromNote.current = false;
      });
    }
  }, [restoreScrollPosition]);

  // Modified click handler for notes
  const handleNoteClick = useCallback(
    (noteId) => {
      saveScrollPosition(window.scrollY);
      isReturningFromNote.current = true;
    },
    [saveScrollPosition]
  );

  // Other handlers remain the same
  const handleViewChange = useCallback(
    (newView) => {
      if (newView === view) {
        setState((prev) => ({
          ...prev,
          page: 1,
          allNotes: [],
          hasMore: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          view: newView,
          page: 1,
          allNotes: [],
          hasMore: true,
        }));
      }
    },
    [view]
  );

  const loadMoreNotes = useCallback(() => {
    if (
      !isLoading &&
      notesData?.totalPages &&
      page < notesData.totalPages &&
      view === "recent"
    ) {
      isLoadingRef.current = true;
      setState((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [isLoading, notesData, page, view]);

  // Setup intersection observer
  useEffect(() => {
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

  // Save state effect remains the same
  useEffect(() => {
    const clearAndSaveState = () => {
      try {
        if (page !== 1 || view !== "recent") {
          storage.set(STORAGE_KEYS.STATE, { view, page, allNotes });
        } else {
          storage.remove(STORAGE_KEYS.STATE);
        }
      } catch (error) {
        console.error("Error saving state:", error);
      }
    };

    window.addEventListener("beforeunload", clearAndSaveState);
    return () => {
      window.removeEventListener("beforeunload", clearAndSaveState);
      clearAndSaveState();
    };
  }, [view, page, allNotes]);

  // Update notes data effect remains the same
  useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setState((prev) => {
        const newNotes = notesData.notes || [];

        if (page === 1) {
          return {
            ...prev,
            allNotes: newNotes,
            hasMore: notesData.currentPage < notesData.totalPages,
          };
        }

        const existingNotesMap = new Map(
          prev.allNotes.map((note) => [note.id || note._id, note])
        );

        const uniqueNewNotes = newNotes.filter(
          (note) => !existingNotesMap.has(note.id || note._id)
        );

        return {
          ...prev,
          allNotes: [...prev.allNotes, ...uniqueNewNotes],
          hasMore: notesData.currentPage < notesData.totalPages,
        };
      });
    }
  }, [isSuccess, notesData, view, page]);

  if (isError) return <p className="errmsg">{error?.data?.message}</p>;
  if (!isSuccess && view === "recent") return null;

  const noteIds = {
    recent: Array.from(
      new Set(state.allNotes?.map((note) => note.id || note._id) || [])
    ),
    trend: Array.from(
      new Set(trendingNotesData?.map((note) => note._id) || [])
    ),
    following: Array.from(new Set(followingNotesData?.ids || [])),
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
            <Note key={id} noteId={id} onClick={() => handleNoteClick(id)} />
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
