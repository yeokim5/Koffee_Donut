export const imageExtracter = async (editorContent) => {
  const urls = extractUrls(editorContent);
  // console.log("urls", urls);
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
    isTikTokUrl: getTikTokImage,
    isDirectImageUrl: (url) => url,
  };

  for (const [checker, handler] of Object.entries(urlHandlers)) {
    if (urlCheckers[checker](url)) {
      return await handler(url);
    }
  }

  return null;
};

const extractUrls = (editorContent) => {
  try {
    const content = JSON.parse(editorContent);
    const urls = [];

    content.blocks.forEach((block) => {
      if (block.type === "youtubeEmbed" || block.type === "embed") {
        urls.push(block.data.url || block.data.source);
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
  isYoutubeUrl: (url) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube.com/shorts")
    );
  },
  isInstagramUrl: (url) => {
    return (
      url.includes("instagram.com/p/") || url.includes("instagram.com/reel/")
    );
  },
  isTwitterUrl: (url) => {
    return url.includes("x.com") || url.includes("twitter.com");
  },
  isTikTokUrl: (url) => {
    return url.includes("tiktok.com");
  },
  isDirectImageUrl: (url) => /\.(png|jpg|jpeg|webp|gif)$/i.test(url),
};

const getYoutubeImage = (url) => {
  let videoId;
  if (url.includes("shorts")) {
    videoId = url.match(/shorts\/([^?\/]+)/)?.[1];
  } else {
    videoId =
      url.match(/(?:v=|\/)([\w-]{11})(?:\?|$)/)?.[1] ||
      url.match(/youtu\.be\/([\w-]{11})(?:\?|$)/)?.[1];
  }
  return videoId ? `http://img.youtube.com/vi/${videoId}/0.jpg` : null;
};

const getInstagramImage = async (url) => {
  return "https://koffee-donut.s3.amazonaws.com/instagram.webp";
};

const getTwitterImage = async (url) => {
  return "https://koffee-donut.s3.amazonaws.com/X_logo.webp";
};

const getTikTokImage = async (url) => {
  return "https://koffee-donut.s3.amazonaws.com/tiktok.webp";
};

const getDefaultImageUrl = () =>
  "https://koffee-donut.s3.amazonaws.com/no+image.png";
