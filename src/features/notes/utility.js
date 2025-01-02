// Utility functions for managing view data in localStorage
export const getLastViewData = () => {
  const data = localStorage.getItem("lastView");
  return data ? JSON.parse(data) : {};
};

export const setLastViewData = (data) => {
  localStorage.setItem("lastView", JSON.stringify(data));
};

export const cleanUpExpiredViews = () => {
  const lastViewData = getLastViewData();
  const thirtyMinutesInMs = 30 * 60 * 1000;
  const now = Date.now();

  // Filter out expired entries
  const updatedLastViewData = Object.fromEntries(
    Object.entries(lastViewData).filter(([noteId, timestamp]) => {
      return now - timestamp < thirtyMinutesInMs;
    })
  );

  // Update the localStorage with only valid entries
  setLastViewData(updatedLastViewData);
};

export const shouldIncrementView = (noteId) => {
  const lastViewData = getLastViewData();
  const lastViewTime = lastViewData[noteId];
  if (!lastViewTime) return true;

  const timeDiff = Date.now() - lastViewTime;
  const thirtyMinutesInMs = 30 * 60 * 1000;

  return timeDiff >= thirtyMinutesInMs;
};

export const getVisitedNotes = () => {
  const data = localStorage.getItem("visited");
  return data ? JSON.parse(data) : {};
};

export const setVisitedNote = (noteId) => {
  const visitedNotes = getVisitedNotes();
  visitedNotes[noteId] = Date.now();
  localStorage.setItem("visited", JSON.stringify(visitedNotes));
};

export const cleanUpExpiredVisits = () => {
  const visitedNotes = getVisitedNotes();
  const oneHourInMs = 10 * 1000;
  const now = Date.now();

  // Filter out expired entries
  const updatedVisitedNotes = Object.fromEntries(
    Object.entries(visitedNotes).filter(([noteId, timestamp]) => {
      return now - timestamp < oneHourInMs;
    })
  );

  // Update the localStorage with only valid entries
  localStorage.setItem("visited", JSON.stringify(updatedVisitedNotes));
};

export const isNoteVisited = (noteId) => {
  const visitedNotes = getVisitedNotes();
  const visitTime = visitedNotes[noteId];
  if (!visitTime) return false;

  const timeDiff = Date.now() - visitTime;
  const oneHourInMs = 10 * 1000;

  return timeDiff < oneHourInMs;
};
