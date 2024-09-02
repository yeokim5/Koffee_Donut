import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const observerRef = useRef();
  const loadingRef = useRef(null);

  const { username } = useAuth() || {};

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

  useEffect(() => {
    if (isSuccess && notesData && view === "recent") {
      setAllNotes((prevNotes) => {
        const newNotes = notesData.notes.ids.filter(
          (id) => !prevNotes.some((note) => note.id === id)
        );
        return [...prevNotes, ...newNotes.map((id) => ({ id, page }))];
      });
    }
  }, [isSuccess, notesData, page, view]);

  const loadMoreNotes = useCallback(() => {
    if (
      !isLoading &&
      notesData &&
      page < notesData.totalPages &&
      view === "recent"
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoading, notesData, page, view]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotes();
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreNotes]);

  const handleViewChange = (newView) => {
    setView(newView);
    setPage(1); // Reset page when changing views
    setAllNotes([]); // Clear allNotes when changing views
  };

  let content;

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  }

  if (isSuccess) {
    let tableContent;

    if (view === "recent") {
      tableContent = allNotes.length ? (
        allNotes.map(({ id, page }) => (
          <Note key={`${id}-${page}`} noteId={id} />
        ))
      ) : (
        <p>No notes found</p>
      );
    } else if (view === "trend") {
      tableContent = trendingIds.length ? (
        trendingIds.map((id) => <Note key={id} noteId={id} />)
      ) : (
        <p>No trending notes found</p>
      );
    } else if (view === "following") {
      tableContent = followingIds.length ? (
        followingIds.map((id) => <Note key={id} noteId={id} />)
      ) : (
        <p>No following notes found</p>
      );
    }

    content = (
      <>
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
        <div className="notes-list">
          {tableContent}
          {view === "recent" && (
            <div ref={loadingRef}>
              {isLoading && <PulseLoader color={"#FFF"} />}
              {!isLoading && page < notesData.totalPages && (
                <p style={{ textAlign: "center" }}>
                  <PulseLoader />
                </p>
              )}
              {page >= notesData.totalPages && <p> </p>}
            </div>
          )}
        </div>
      </>
    );
  }

  return content;
};

export default NotesList;
