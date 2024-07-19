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
  const [editorData, setEditorData] = useState(initialData);

  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      onReady: () => {
        ejInstance.current = editor;
      },
      readOnly: readMode,
      data: editorData || { blocks: [] },
      onChange: async () => {
        if (!readMode) {
          let content = await editor.save();
          setEditorData(content);
          onChange(content);

          // Save to localStorage
          try {
            localStorage.setItem("editorContent", JSON.stringify(content));
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }
        }
      },
      tools: EDITOR_JS_TOOLS,
      minHeight: 20,
    });
  }, [readMode, onChange, editorData]);

  useEffect(() => {
    // Load from localStorage on component mount
    try {
      const savedContent = localStorage.getItem("editorContent");
      if (savedContent) {
        setEditorData(JSON.parse(savedContent));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }

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
