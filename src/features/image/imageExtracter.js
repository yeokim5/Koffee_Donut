export const imageExtracter = async (editorContent) => {
  const urls = extractUrls(editorContent);
  return await getFirstValidImageUrl(urls);
};

const getFirstValidImageUrl = async (urls) => {
  for (const url of urls) {
    const imageUrl = await getImageUrl(url);
    if (imageUrl) return imageUrl;
  }
  return getDefaultImageUrl();
};

const getImageUrl = async (url) => {
  const urlHandlers = {
    isYoutubeUrl: getYoutubeImage,
    isInstagramUrl: getInstagramImage,
    isTwitterUrl: getTwitterImage,
    isDirectImageUrl: (url) => url,
  };

  for (const [checker, handler] of Object.entries(urlHandlers)) {
    if (urlCheckers[checker](url)) {
      return await handler(url);
    }
  }

  return null;
};

/* Extract url from JSON */
const extractUrls = (editorContent) => {
  try {
    const content = JSON.parse(editorContent);
    const urls = [];

    content.blocks.forEach((block) => {
      if (block.type === "embed") {
        urls.push(block.data.source);
      } else if (block.type === "image") {
        urls.push(block.data.file.url);
      }
    });

    return urls;
  } catch (error) {
    console.error("Error parsing editorContent:", error);
    return [];
  }
};

const urlCheckers = {
  isYoutubeUrl: (url) =>
    url.includes("youtube.com") || url.includes("youtu.be"),
  isInstagramUrl: (url) => url.includes("instagram.com"),
  isTwitterUrl: (url) => url.includes("x.com") || url.includes("twitter.com"),
  isDirectImageUrl: (url) => /\.(png|jpg|jpeg)$/i.test(url),
};

const getYoutubeImage = (url) => {
  const videoId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|$)/)?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : null;
};

const getInstagramImage = async (url) => {
  const postId =
    url.match(/\/p\/([^/?]+)/)?.[1] || url.match(/\/reel\/([^/?]+)/)?.[1];
  if (!postId) return null;

  const imageUrl = `https://www.instagram.com/p/${postId}/media/?size=l`;
  try {
    return await getFinalRedirectedUrl(imageUrl);
  } catch (error) {
    console.error("Error getting Instagram image:", error);
    return null;
  }
};

const getFinalRedirectedUrl = (url) => {
  return new Promise((resolve, reject) => {
    // If using https, replace with fetch or another browser-compatible method
    fetch(url)
      .then((response) => {
        if (
          response.status >= 300 &&
          response.status < 400 &&
          response.headers.get("location")
        ) {
          resolve(getFinalRedirectedUrl(response.headers.get("location")));
        } else {
          resolve(url);
        }
      })
      .catch((error) => reject(error));
  });
};

const getTwitterImage = async (url) => {
  // TODO: Implement Twitter image extraction
  return null;
};

const getDefaultImageUrl = () =>
  "https://koffee-donut.s3.amazonaws.com/no+image.png";
