// Service to keep the backend warm by pinging it regularly
const pingServer = async () => {
  try {
    // Fix the URL construction to avoid double slashes
    const backendUrl = process.env.REACT_APP_BACKEND_URL.endsWith("/")
      ? process.env.REACT_APP_BACKEND_URL.slice(0, -1)
      : process.env.REACT_APP_BACKEND_URL;

    const response = await fetch(`${backendUrl}/ping`, {
      // Add no-cors mode as a fallback when CORS isn't configured
      mode: "no-cors",
    });

    console.log("Keep-alive ping sent");
  } catch (error) {
    console.error("Keep-alive ping failed:", error);
  }
};

const startKeepAliveService = () => {
  // Initial ping
  pingServer();

  // Ping every 5 minutes
  setInterval(pingServer, 5 * 60 * 1000);
};

export default startKeepAliveService;
