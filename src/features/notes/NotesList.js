import React, { useMemo, useState } from "react";
import { useGetNotesQuery } from "./notesApiSlice";
import Note from "./Note";

const NoteList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("recent"); // New state for view selection
  const notesPerPage = 10;

  const {
    data: notes,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery("notesList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const sortedNoteIds = useMemo(() => {
    if (isSuccess) {
      const noteIds = Object.keys(notes.entities);
      return noteIds.sort((a, b) => {
        const dateA = new Date(notes.entities[a].createdAt);
        const dateB = new Date(notes.entities[b].createdAt);
        return dateB - dateA;
      });
    }
    return [];
  }, [isSuccess, notes]);

  const trendingNoteIds = useMemo(() => {
    if (isSuccess) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
      return sortedNoteIds.filter((noteId) => {
        const note = notes.entities[noteId];
        const noteDate = new Date(note.createdAt);
        return note.likes >= 1 && noteDate > twentyFourHoursAgo;
      });
    }
    return [];
  }, [isSuccess, notes, sortedNoteIds]);

  const displayedNoteIds = view === "recent" ? sortedNoteIds : trendingNoteIds;
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
    setCurrentPage(1); // Reset to first page when changing views
  };

  let content;

  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error: {error?.data?.message}</p>;
  } else if (isSuccess) {
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
