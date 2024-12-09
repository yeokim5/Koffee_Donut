![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Universal Embed Tool

An [Editor.js](https://editorjs.io) plugin to embed various social media content.

Simply copy and paste URLs from:

- YouTube (videos and shorts)
- Instagram (posts and reels)
- TikTok
- Twitter/X
- Reddit

## Supported URL formats:

- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- YouTube Shorts: `https://youtube.com/shorts/VIDEO_ID`
- Instagram: `https://instagram.com/p/POST_ID` or `https://instagram.com/reel/REEL_ID`
- TikTok: `https://tiktok.com/@username/video/VIDEO_ID`
- Twitter/X: `https://twitter.com/username/status/TWEET_ID` or `https://x.com/username/status/TWEET_ID`
- Reddit: `https://reddit.com/r/subreddit/comments/POST_ID`

![](assets/demo.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i editorjs-youtube-embed
```

Include module at your application

```javascript
const YoutubeEmbed = require("editorjs-youtube-embed");
```

### Download to your project's source dir

1. Download folder `dist` from repository
2. Add `dist/main.js` file to your page.

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...

  tools: {
    ...
    youtubeEmbed: YoutubeEmbed,
  }

  ...
});
```

## Config Params

This tool has no config params

## Output data

| Field | Type     | Description |
| ----- | -------- | ----------- |
| url   | `string` | video url   |

```json
{
  "type": "youtubeEmbed",
  "data": {
    "url": "https://www.youtube.com/watch?v=L229QDxDakU"
  }
}
```
