import React, { useState, useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";

const EDITOR_JS_TOOLS = {
  header: Header,
  list: List,
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByFile(file) {
          // Create a FormData instance
          const formData = new FormData();
          formData.append("image", file);

          // Send the file to your server
          return fetch("http://localhost:3500/upload", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.success === 0) {
                throw new Error(result.error);
              }
              return {
                success: 1,
                file: {
                  url: result.file.url,
                },
              };
            })
            .catch((error) => {
              console.error("Error uploading image:", error);
              return {
                success: 0,
                error: error.message || "Upload failed",
              };
            });
        },
        uploadByUrl(url) {
          return fetch("http://localhost:3500/getImage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.success === 0) {
                throw new Error(result.error);
              }
              return {
                success: 1,
                file: {
                  url: result.file.url,
                },
              };
            })
            .catch((error) => {
              console.error("Error uploading image by URL:", error);
              return {
                success: 0,
                error: error.message || "Upload failed",
              };
            });
        },
      },
    },
  },
  embed: {
    class: Embed,
    inlineToolbar: true,
    config: {
      services: {
        youtube: true,
        instagram: {
          regex: /https?:\/\/www\.instagram\.com\/p\/([^\/\?\&]+)\/?.*/,
          embedUrl: "https://www.instagram.com/p/<%= remote_id %>/embed",
          html: '<iframe width="400" height="505" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
        },
        facebook: true,
        twitter: true,
        shorts: {
          regex: /https?:\/\/youtube\.com\/shorts\/([^\/\?\&]+)\/?.*/,
          embedUrl: "https://www.youtube.com/embed/<%= remote_id %>",
          html: '<iframe width="315" height="560" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
        },
        reels: {
          regex: /https?:\/\/www\.instagram\.com\/reel\/([^\/\?\&]+)\/?.*/,
          embedUrl: "https://www.instagram.com/p/<%= remote_id %>/embed",
          html: "<iframe></iframe>",
        },
      },
    },
  },
};

const EditorComponent = ({ initialData, onChange, readMode }) => {
  const ejInstance = useRef();
  const initialDataRef = useRef(initialData);

  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      onReady: () => {
        ejInstance.current = editor;
      },
      readOnly: readMode,
      data: initialDataRef.current || { blocks: [] },
      onChange: async () => {
        if (!readMode) {
          let content = await editor.saver.save();
          onChange(content);
        }
      },
      tools: EDITOR_JS_TOOLS,
      minHeight: 20,
    });
  }, [readMode, onChange]);

  useEffect(() => {
    if (ejInstance.current === null) {
      initEditor();
    }

    return () => {
      ejInstance?.current?.destroy();
      ejInstance.current = null;
    };
  }, [initEditor]);

  return <div id="editorjs" className="editor-container"></div>;
};

export default EditorComponent;
