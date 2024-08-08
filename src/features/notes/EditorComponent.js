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
          const formData = new FormData();
          formData.append("file", file);

          console.log("Uploading file:", file.name);

          return fetch(process.env.REACT_APP_BACKEND_URL + "/upload", {
            method: "POST",
            body: formData,
          })
            .then(async (response) => {
              if (!response.ok) {
                const errorBody = await response.text();
                console.error("Server error response:", errorBody);
                throw new Error(
                  `HTTP error! status: ${response.status}, body: ${errorBody}`
                );
              }
              return response.json();
            })
            .then((result) => {
              console.log("Server success response:", result);
              if (result.success === 0) {
                throw new Error(result.error || "Upload failed");
              }
              return {
                success: 1,
                file: {
                  url: result.file.url,
                },
              };
            })
            .catch((error) => {
              console.error("Upload error:", error);
              return {
                success: 0,
                error: error.message || "Upload failed",
              };
            });
        },
        uploadByUrl(url) {
          return fetch(process.env.REACT_APP_BACKEND_URL + "/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          })
            .then(async (response) => {
              if (!response.ok) {
                const errorBody = await response.text();
                console.error("Server response:", errorBody);
                throw new Error(
                  `HTTP error! status: ${response.status}, body: ${errorBody}`
                );
              }
              return response.json();
            })
            .then((result) => {
              console.log("Server response:", result);
              if (result.success === 0) {
                throw new Error(result.error || "Upload failed");
              }
              return {
                success: 1,
                file: {
                  url: result.file.url,
                },
              };
            })
            .catch((error) => {
              console.error("Detailed error:", error);
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
        youtube: {
          regex:
            /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]{11})(?:[?&].*)?/,
          embedUrl: "https://www.youtube.com/embed/<%= remote_id %>",
          html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
          height: 320,
          width: 580,
        },
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
  const ejInstance = useRef(null);
  const initialDataRef = useRef(initialData);

  const initEditor = useCallback(() => {
    try {
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

            // Check if the last block is a text block
            const lastBlock = content.blocks[content.blocks.length - 1];
            if (lastBlock.type !== "paragraph" || !lastBlock.data.text.trim()) {
              // If not, add an empty text block
              content.blocks.push({
                type: "paragraph",
                data: {
                  text: "",
                },
              });
            }

            onChange(content);
          }
        },
        tools: EDITOR_JS_TOOLS,
        minHeight: 20,
      });
    } catch (error) {
      console.error("Failed to initialize EditorJS:", error);
    }
  }, [readMode, onChange]);

  useEffect(() => {
    // Ensure the editor is initialized only once the component has mounted
    if (ejInstance.current === null) {
      const element = document.getElementById("editorjs");
      if (element) {
        initEditor();
      } else {
        console.error("Editor container element not found");
      }
    }

    // Cleanup editor instance on component unmount
    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [initEditor]);

  return <div id="editorjs" className="editor-container"></div>;
};

export default EditorComponent;
