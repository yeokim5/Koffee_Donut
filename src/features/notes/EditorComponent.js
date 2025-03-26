import React, { useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import UniversalEmbed from "./editorjs-youtube-embed-main/src";

const EDITOR_JS_TOOLS = {
  header: {
    class: Header,
    config: {
      placeholder: "Enter a header",
      levels: [1, 2, 3, 4],
      defaultLevel: 2,
    },
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByFile(file) {
          const formData = new FormData();
          formData.append("file", file);

          console.log("Uploading file:", file.name);

          // Remove trailing slash if present to prevent double slashes
          const baseUrl = process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, "");
          return fetch(`${baseUrl}/upload`, {
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
              console.log("Upload success:", result);
              updatePendingImages(result.file.url);
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
          // Remove trailing slash if present to prevent double slashes
          const baseUrl = process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, "");
          return fetch(`${baseUrl}/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
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
              console.log("Upload success:", result);
              updatePendingImages(result.file.url);
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
      },
    },
  },
  embed: UniversalEmbed,
};

function updatePendingImages(newImageUrl) {
  const existingImages = JSON.parse(
    localStorage.getItem("pendingImage") || "[]"
  );
  const updatedImages = [...existingImages, newImageUrl];
  localStorage.setItem("pendingImage", JSON.stringify(updatedImages));
}

const EditorComponent = ({ initialData, onChange, readMode }) => {
  const ejInstance = useRef(null);
  const initialDataRef = useRef(initialData);

  const observeEditorElements = () => {
    const editorElement = document.querySelector(".codex-editor");
    const dashFooter = document.querySelector(".dash-footer");
    if (!editorElement || !dashFooter) {
      console.warn("Required elements not found");
      return;
    }

    const isAnyPopoverOpen = () => {
      return (
        editorElement.classList.contains("codex-editor--toolbox-opened") ||
        document.querySelector(".ce-settings .ce-popover--opened")
      );
    };

    const updateFooterZIndex = () => {
      dashFooter.style.zIndex = isAnyPopoverOpen() ? "0" : "1";
    };

    const editorObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateFooterZIndex();
        }
      });
    });

    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          const settingsElement = document.querySelector(".ce-settings");
          if (settingsElement) {
            const settingsObserver = new MutationObserver(updateFooterZIndex);
            settingsObserver.observe(settingsElement, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ["class"],
            });
            if (ejInstance.current) {
              ejInstance.current.settingsObserver = settingsObserver;
            }
          }
        }
      });
    });

    editorObserver.observe(editorElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    return { editorObserver, bodyObserver };
  };

  const initEditor = useCallback(() => {
    try {
      const editor = new EditorJS({
        holder: "editorjs",
        onReady: () => {
          ejInstance.current = editor;
          const observers = observeEditorElements();
          ejInstance.current.observers = observers;
        },
        readOnly: readMode,
        data: initialDataRef.current || { blocks: [] },
        onChange: async () => {
          if (!readMode) {
            try {
              const content = await editor.saver.save();
              if (!content.blocks.length) {
                content.blocks.push({
                  type: "paragraph",
                  data: { text: "" },
                });
              }
              onChange(content);
            } catch (error) {
              console.error("Error saving content:", error);
            }
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
    if (ejInstance.current === null) {
      const element = document.getElementById("editorjs");
      if (element) {
        initEditor();
      } else {
        console.error("Editor container element not found");
      }
    }

    return () => {
      if (ejInstance.current) {
        if (ejInstance.current.observers) {
          ejInstance.current.observers.editorObserver.disconnect();
          ejInstance.current.observers.bodyObserver.disconnect();
        }
        if (ejInstance.current.settingsObserver) {
          ejInstance.current.settingsObserver.disconnect();
        }
        ejInstance.current.destroy?.();
        ejInstance.current = null;
      }
    };
  }, [initEditor]);

  return <div id="editorjs" className="editor-container" />;
};

export default EditorComponent;
