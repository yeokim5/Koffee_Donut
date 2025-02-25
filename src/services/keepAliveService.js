/**
 * This service helps prevent cold starts by periodically pinging the backend
 * It keeps the serverless functions warm
 */
const startKeepAliveService = () => {
  // Function to ping the backend
  const pingBackend = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/ping`, {
        method: "GET",
        cache: "no-store", // Ensure we don't cache the response
      });
      console.log("Keep-alive ping sent successfully");
    } catch (error) {
      console.error("Keep-alive ping failed:", error);
    }
  };

  // Initial ping when the app loads
  pingBackend();

  // Set up interval (every 5 minutes)
  const intervalId = setInterval(pingBackend, 5 * 60 * 1000);

  // Return function to clear interval if needed
  return () => clearInterval(intervalId);
};

export default startKeepAliveService;
