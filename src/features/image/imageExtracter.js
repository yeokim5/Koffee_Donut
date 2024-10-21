export const imageExtracter = async (editorContent) => {
  const urls = extractUrls(editorContent);
  console.log("urls", urls);
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
    console.log(urls);
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
  isDirectImageUrl: (url) => /\.(png|jpg|jpeg|webp)$/i.test(url),
};

const getYoutubeImage = (url) => {
  const videoId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|$)/)?.[1];
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : null;
};

const getInstagramImage = async (url) => {
  return "https://koffee-donut.s3.amazonaws.com/instagram.webp";
};

const getTwitterImage = async (url) => {
  return "https://koffee-donut.s3.amazonaws.com/X_logo.webp";
};

const getDefaultImageUrl = () =>
  "https://koffee-donut.s3.amazonaws.com/no+image.png";
