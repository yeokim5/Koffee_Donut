export const imageExtracter = async (editorContent) => {
  const urls = extractUrls(editorContent);
  console.log("urls", urls);
  return await getFirstValidImageUrl(urls);
};

const getFirstValidImageUrl = async (urls) => {
  if (urls.length > 0) {
    const firstUrl = urls[0];
    console.log(`imageUrl`, firstUrl);
    return firstUrl;
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
  return "https://img.freepik.com/premium-vector/instagram-logo-vector_768467-330.jpg";
};

const getTwitterImage = async (url) => {
  return "https://banner2.cleanpng.com/20240119/sut/transparent-x-logo-logo-brand-identity-company-organization-black-background-white-x-logo-for-1710916376217.webp";
};

const getDefaultImageUrl = () =>
  "https://koffee-donut.s3.amazonaws.com/no+image.png";
