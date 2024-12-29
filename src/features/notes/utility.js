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
