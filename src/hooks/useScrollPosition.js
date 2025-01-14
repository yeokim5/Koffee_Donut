import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "scrollPosition";
const RESTORE_DELAY = 50;
const RESTORE_ATTEMPTS = 5;
const RESTORE_INTERVAL = 100;

export const useScrollPosition = () => {
  const scrollPositionRef = useRef(0);
  const isRestoringRef = useRef(false);
  const restoreAttemptsRef = useRef(0);
  const contentHeightRef = useRef(0);
  const restorationTimeoutRef = useRef(null);

  const calculateMaxScroll = useCallback(() => {
    // Get all possible height measurements
    const bodyHeight = document.body.scrollHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const contentHeight = Math.max(bodyHeight, documentHeight);

    contentHeightRef.current = contentHeight;
    return Math.max(0, contentHeight - window.innerHeight);
  }, []);

  const isValidScrollTarget = useCallback(
    (position) => {
      const maxScroll = calculateMaxScroll();
      return (
        typeof position === "number" &&
        isFinite(position) &&
        position >= 0 &&
        position <= maxScroll &&
        contentHeightRef.current > window.innerHeight // Ensure there's actually scrollable content
      );
    },
    [calculateMaxScroll]
  );

  const saveScrollPosition = useCallback(
    (position) => {
      try {
        if (isValidScrollTarget(position)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(position));
          scrollPositionRef.current = position;
        }
      } catch (e) {
        console.warn("Failed to save scroll position:", e);
      }
    },
    [isValidScrollTarget]
  );

  const getStoredPosition = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const position = stored ? JSON.parse(stored) : null;

      return isValidScrollTarget(position) ? position : null;
    } catch (e) {
      console.warn("Failed to retrieve scroll position:", e);
      return null;
    }
  }, [isValidScrollTarget]);

  const handleScroll = useCallback(() => {
    if (!isRestoringRef.current) {
      const currentPosition = window.scrollY;
      saveScrollPosition(currentPosition);
    }
  }, [saveScrollPosition]);

  const attemptRestore = useCallback(
    (targetPosition) => {
      if (
        !isValidScrollTarget(targetPosition) ||
        restoreAttemptsRef.current >= RESTORE_ATTEMPTS
      ) {
        isRestoringRef.current = false;
        restoreAttemptsRef.current = 0;
        return;
      }

      // Force a reflow to ensure accurate scroll heights
      const maxScroll = calculateMaxScroll();

      // Double-check validity after forcing reflow
      if (targetPosition > maxScroll) {
        isRestoringRef.current = false;
        restoreAttemptsRef.current = 0;
        return;
      }

      // Use both approaches for more reliable scrolling
      window.scroll(0, targetPosition);
      document.documentElement.scrollTop = targetPosition;
      document.body.scrollTop = targetPosition;

      if (restorationTimeoutRef.current) {
        clearTimeout(restorationTimeoutRef.current);
      }

      restorationTimeoutRef.current = setTimeout(() => {
        const currentScroll = window.scrollY;

        // Check if we're close enough to the target position
        if (
          Math.abs(currentScroll - targetPosition) > 2 &&
          restoreAttemptsRef.current < RESTORE_ATTEMPTS
        ) {
          restoreAttemptsRef.current++;
          attemptRestore(targetPosition);
        } else {
          isRestoringRef.current = false;
          restoreAttemptsRef.current = 0;
        }
      }, RESTORE_INTERVAL);
    },
    [calculateMaxScroll, isValidScrollTarget]
  );

  const restoreScrollPosition = useCallback(() => {
    const savedPosition = getStoredPosition();

    if (savedPosition !== null) {
      isRestoringRef.current = true;
      restoreAttemptsRef.current = 0;

      // Ensure content is loaded before attempting to scroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Force a layout recalculation
          calculateMaxScroll();
          attemptRestore(savedPosition);
        }, RESTORE_DELAY);
      });
    }
  }, [getStoredPosition, attemptRestore, calculateMaxScroll]);

  const clearScrollPosition = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      scrollPositionRef.current = 0;
      if (restorationTimeoutRef.current) {
        clearTimeout(restorationTimeoutRef.current);
      }
    } catch (e) {
      console.warn("Failed to clear scroll position:", e);
    }
  }, []);

  useEffect(() => {
    // Wait for next frame to ensure initial content is rendered
    requestAnimationFrame(() => {
      calculateMaxScroll();
      window.addEventListener("scroll", handleScroll);
      restoreScrollPosition();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (restorationTimeoutRef.current) {
        clearTimeout(restorationTimeoutRef.current);
      }
    };
  }, [handleScroll, restoreScrollPosition, calculateMaxScroll]);

  return {
    saveScrollPosition,
    clearScrollPosition,
    restoreScrollPosition,
    currentPosition: scrollPositionRef.current,
  };
};
