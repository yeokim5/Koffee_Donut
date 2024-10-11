import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetNotesQuery,
  useGetTrendingNotesQuery,
  useGetFollowerNotesQuery,
} from "./notesApiSlice";
import Note from "./Note";
import { PulseLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";

const NotesList = () => {
  const [page, setPage] = useState(1);
  const [allNotes, setAllNotes] = useState([]);
  const [view, setView] = useState("recent");
  const loadingRef = useRef(null);
  const location = useLocation();
  const scrollPositionRef = useRef(0);
  const isLoadingRef = useRef(false);
  const previousHeightRef = useRef(0); // For storing previous page height
  const navigate = useNavigate();

  const { username } = useAuth();
  const {
    data: notesData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery({ page, limit: 10 });
  const { data: trendingNotesData } = useGetTrendingNotesQuery();
  const { data: followingNotesData } = useGetFollowerNotesQuery(username);

  const trendingIds = trendingNotesData?.map((note) => note._id) || [];
  const followingIds = followingNotesData?.ids || [];

  // Load saved state on initial render
  useEffect(() => {
    const savedState = JSON.parse(sessionStorage.getItem("notesListState"));
    if (savedState) {
      setView(savedState.view);
      setPage(savedState.page);
      setAllNotes(savedState.allNotes);
    }
  }, []);

  // Save state on unmount
  useEffect(() => {
    return () => {
      const stateToSave = { view, page, allNotes };
      sessionStorage.setItem("notesListState", JSON.stringify(stateToSave));
    };
  }, [view, page, allNotes]);

  // Save and restore scroll position on location change
  useEffect(() => {
    const handleScroll = () => {
      if (!isLoadingRef.current) {
        scrollPositionRef.current = window.scrollY;
      }
    };

    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem("scrollPosition");
      if (savedPosition !== null) {
        setTimeout(() => {
          window.scrollTo(0, parseFloat(savedPosition));
        }, 0);
      }
    };

    window.addEventListener("scroll", handleScroll);

    if (!isLoadingRef.current) {
      restoreScrollPosition();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (!isLoadingRef.current) {
        sessionStorage.setItem(
          "scrollPosition",
          scrollPositionRef.current.toString()
        );
      }
    };
  }, [location]);

  // Load more notes with scroll position tracking
  const loadMoreNotes = useCallback(() => {
    if (
      !isLoading &&
      notesData &&
      page < notesData.totalPages &&
      view === "recent"
    ) {
      isLoadingRef.current = true;
      previousHeightRef.current = document.body.scrollHeight; // Capture current height before loading
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoading, notesData, page, view]);

  // Update notes when data is fetched
  useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setAllNotes((prevNotes) => {
        const newNotes = notesData.notes.ids.filter(
          (id) => !prevNotes.some((note) => note.id === id)
        );
        const updatedNotes = [...prevNotes, ...newNotes.map((id) => ({ id }))];
        return updatedNotes;
      });
    }
  }, [isSuccess, notesData, view]);

  // Adjust scroll position after notes are updated
  useLayoutEffect(() => {
    if (isLoadingRef.current) {
      const newHeight = document.body.scrollHeight;
      const heightDifference = newHeight - previousHeightRef.current; // Difference in height
      window.scrollTo(0, scrollPositionRef.current + heightDifference); // Adjust scroll position
      isLoadingRef.current = false;
    }
  }, [allNotes]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreNotes();
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) observer.observe(loadingRef.current);

    return () => {
      if (loadingRef.current) observer.unobserve(loadingRef.current);
      observer.disconnect();
    };
  }, [loadingRef, loadMoreNotes]);

  const handleViewChange = (newView) => {
    setView(newView);
    setPage(1);
    setAllNotes([]);
    window.scrollTo(0, 0);
    sessionStorage.removeItem("scrollPosition");
  };

  const renderNotes = () => {
    const noteIds = {
      recent: allNotes.map((note) => note.id),
      trend: trendingIds,
      following: followingIds,
    }[view];

    return noteIds.length ? (
      noteIds.map((id) => (
        <div key={id} onClick={() => handleNoteClick(id)}>
          <Note noteId={id} />
        </div>
      ))
    ) : (
      <p>No {view} notes found</p>
    );
  };

  const handleNoteClick = (noteId) => {
    sessionStorage.setItem(
      "scrollPosition",
      scrollPositionRef.current.toString()
    );
  };

  if (isError) return <p className="errmsg">{error?.data?.message}</p>;

  if (!isSuccess) return null;

  return (
    <>
      <div className="view-selector">
        {["recent", "trend", ...(username ? ["following"] : [])].map(
          (viewOption) => (
            <button
              key={viewOption}
              onClick={() => handleViewChange(viewOption)}
              className={view === viewOption ? "active" : ""}
            >
              {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
            </button>
          )
        )}
      </div>
      <div className="notes-list">
        {renderNotes()}
        {view === "recent" && (
          <div ref={loadingRef}>
            {isLoading && <PulseLoader color={"#FFF"} />}
            {!isLoading && page < notesData.totalPages && (
              <p style={{ textAlign: "center" }}>
                <PulseLoader />
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotesList;
