/**
 * Universal embed plugin for Editor.js.
 */

import "./main.css";
import ToolboxIcon from "./svg/toolbox.svg";

export default class UniversalEmbed {
  static get toolbox() {
    return {
      title: "Embed",
      //   icon: ToolboxIcon,
    };
  }

  constructor({ data, config, api, readOnly }) {
    this.data = data;
    this.readOnly = readOnly;
    this.wrapper = null;
    this.url = null;
    this.isEdited = false;
  }

  render() {
    this.wrapper = document.createElement("div");
    const input = document.createElement("input");
    input.value = this.data && this.data.url ? this.data.url : "";
    this.url = input.value;
    input.placeholder =
      "Paste URL to embed content (YouTube, Instagram, etc.)...";

    this.wrapper.classList.add("block-wrapper");
    this.wrapper.appendChild(input);
    this._createEmbed(input.value);

    input.addEventListener("change", (event) => {
      this.isEdited = true;
      this.url = input.value;
      this._createEmbed(input.value);
    });
    return this.wrapper;
  }

  _createEmbed(url) {
    if (!url) {
      return;
    }

    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );

    // Instagram Post/Reel
    const instagramMatch = url.match(
      /(?:instagram\.com\/(p|reel)\/([^\/\?\&]+))/
    );

    // YouTube Shorts
    const youtubeShortsMatch = url.match(/youtube\.com\/shorts\/([^\/\?\&]+)/);

    // New patterns
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    const twitterMatch = url.match(/twitter\.com\/\w+\/status\/(\d+)/);
    const xMatch = url.match(/x\.com\/\w+\/status\/(\d+)/);

    this.wrapper.innerHTML = null;
    const embedContainer = document.createElement("div");
    embedContainer.classList.add("embed-wrapper");

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
      iframe.setAttribute("allowfullscreen", true);
      embedContainer.classList.add("youtube");
      embedContainer.appendChild(iframe);
    } else if (instagramMatch) {
      const [, type, postId] = instagramMatch;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", `https://www.instagram.com/p/${postId}/embed`);
      iframe.setAttribute("allowfullscreen", true);

      // Add specific class based on content type
      if (type === "reel") {
        embedContainer.classList.add("instagram-reel");
      } else {
        embedContainer.classList.add("instagram-post");
      }
      embedContainer.appendChild(iframe);
    } else if (youtubeShortsMatch) {
      const videoId = youtubeShortsMatch[1];
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
      iframe.setAttribute("allowfullscreen", true);
      embedContainer.classList.add("youtube-shorts");
      embedContainer.appendChild(iframe);
    } else if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", `https://www.tiktok.com/embed/v2/${videoId}`);
      iframe.setAttribute("allowfullscreen", true);
      embedContainer.classList.add("tiktok");
      embedContainer.appendChild(iframe);
    } else if (twitterMatch || xMatch) {
      const tweetId = (twitterMatch || xMatch)[1];
      // Load Twitter widget script
      if (!window.twttr) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.head.appendChild(script);
      }

      const tweetContainer = document.createElement("div");
      embedContainer.classList.add("twitter");
      embedContainer.appendChild(tweetContainer);

      // Wait for Twitter widgets to load
      const checkTwttr = setInterval(() => {
        if (window.twttr) {
          clearInterval(checkTwttr);
          window.twttr.widgets.createTweet(tweetId, tweetContainer, {
            theme: "light",
          });
        }
      }, 100);
    } else {
      if (this.isEdited) {
        const input = document.createElement("input");
        input.value = this.url;
        input.placeholder =
          "Paste URL to embed content (YouTube, Instagram, TikTok, Twitter/X)...";
        input.classList.add("invalid");
        this.wrapper.appendChild(input);
        return;
      }
    }

    this.wrapper.appendChild(embedContainer);
  }

  static get isReadOnlySupported() {
    return true;
  }

  save(blockContent) {
    return {
      url: this.url,
    };
  }
}
