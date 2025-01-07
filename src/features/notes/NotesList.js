import React, { useState, useCallback, useRef, memo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetNotesQuery,
  useGetTrendingNotesQuery,
  useGetFollowerNotesQuery,
} from "./notesApiSlice";
import Note from "./Note";
import { PulseLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";
import InfiniteScroll from "react-infinite-scroll-component";

// Constants
const NOTES_PER_PAGE = 10;
const STORAGE_KEYS = {
  STATE: "notesListState",
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
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Validate the stored data
      if (parsed && typeof parsed === "object") {
        // Ensure we have valid page number
        if (parsed.page && typeof parsed.page === "number") {
          return parsed;
        }
      }
      // If validation fails, remove invalid data
      sessionStorage.removeItem(key);
      return null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      // Validate data before saving
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

// Main component
const NotesList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useAuth();

  // Refs
  const loadingRef = useRef(null);
  const isLoadingRef = useRef(false);
  const previousHeightRef = useRef(0);
  const observerRef = useRef(null);

  // State initialization with localStorage
  const [state, setState] = useState(() => {
    try {
      // Clear storage on initial load to prevent stale data
      storage.remove(STORAGE_KEYS.STATE);

      return {
        page: 1,
        view: "recent",
        allNotes: [],
        hasMore: true,
      };
    } catch (error) {
      console.error("Error initializing state:", error);
      return {
        page: 1,
        view: "recent",
        allNotes: [],
        hasMore: true,
      };
    }
  });

  const { page, view, allNotes, hasMore } = state;

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

  const handleViewChange = useCallback(
    (newView) => {
      if (newView === view) {
        // If clicking the same view, reset to page 1
        setState((prev) => ({
          ...prev,
          page: 1,
          allNotes: [],
          hasMore: true,
        }));
      } else {
        // Switching to a different view
        setState((prev) => ({
          ...prev,
          view: newView,
          page: 1,
          allNotes: [],
          hasMore: true,
        }));
      }
      window.scrollTo(0, 0);
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
    const clearAndSaveState = () => {
      try {
        // Only save state if we're not on page 1 or if view isn't recent
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

  // Update notes data
  React.useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setState((prev) => {
        const newNotes = notesData.notes || [];

        // If it's page 1, reset the notes array
        if (page === 1) {
          return {
            ...prev,
            allNotes: newNotes,
            hasMore: notesData.currentPage < notesData.totalPages,
          };
        }

        // For subsequent pages, check for duplicates
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

      isLoadingRef.current = false;
    }
  }, [isSuccess, notesData, view, page]);

  const loadMore = useCallback(() => {
    if (!state.hasMore) return;
    setState((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [state.hasMore]);

  useEffect(() => {
    return () => {
      try {
        storage.remove(STORAGE_KEYS.STATE);
      } catch (error) {
        console.error("Error cleaning up storage:", error);
      }
    };
  }, []);

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
          noteIds.map((id) => <Note key={id} noteId={id} />)
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
