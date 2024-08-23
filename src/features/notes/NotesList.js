import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGetNotesQuery } from "./notesApiSlice";
import Note from "./Note";
import { PulseLoader } from "react-spinners";

const NotesList = () => {
  const [page, setPage] = useState(1);
  const [allNotes, setAllNotes] = useState([]);
  const observerRef = useRef();
  const loadingRef = useRef(null);

  const {
    data: notesData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery({ page, limit: 10 });

  useEffect(() => {
    if (isSuccess && notesData) {
      setAllNotes((prevNotes) => {
        const newNotes = notesData.notes.ids.filter(
          (id) => !prevNotes.some((note) => note.id === id)
        );
        return [...prevNotes, ...newNotes.map((id) => ({ id, page }))];
      });
    }
  }, [isSuccess, notesData, page]);

  const loadMoreNotes = useCallback(() => {
    if (!isLoading && notesData && page < notesData.totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoading, notesData, page]);

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

  let content;

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  }

  if (isSuccess) {
    const tableContent = allNotes.length ? (
      allNotes.map(({ id, page }) => <Note key={`${id}-${page}`} noteId={id} />)
    ) : (
      <p>No notes found</p>
    );

    content = (
      <div className="notes-list">
        {tableContent}
        <div ref={loadingRef}>
          {isLoading && <PulseLoader color={"#FFF"} />}
          {!isLoading && page < notesData.totalPages && (
            <p style={{ textAlign: "center" }}>
              <PulseLoader />
            </p>
          )}
          {page >= notesData.totalPages && <p> </p>}
        </div>
      </div>
    );
  }

  return content;
};

export default NotesList;
