import React, { useState, useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import UniversalEmbed from "./editorjs-youtube-embed-main/src";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import Table from "@editorjs/table";

const EDITOR_JS_TOOLS = {
  header: Header,
  // list: List,
  // quote: Quote,
  // delimiter: Delimiter,
  // table: Table,
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
              console.log(
                "This image should be stored in deltedImages",
                result.file.url
              );
              // Update pendingImage in localStorage
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
          return fetch(process.env.REACT_APP_BACKEND_URL + "/upload", {
            method: "POST",
            headers: {
              // "Content-Type": "application/json",
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
              // Update pendingImage in localStorage
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
  embed: UniversalEmbed,
};

// Add this function outside of EDITOR_JS_TOOLS
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

  // Add observer to watch for both toolbox and settings popover
  const observeEditorElements = () => {
    const editorElement = document.querySelector(".codex-editor");
    const dashFooter = document.querySelector(".dash-footer");

    if (!editorElement || !dashFooter) {
      console.warn("Required elements not found");
      return;
    }

    // Function to check if any popover is open
    const isAnyPopoverOpen = () => {
      const hasToolboxOpen = editorElement.classList.contains(
        "codex-editor--toolbox-opened"
      );
      const hasSettingsPopoverOpen = document.querySelector(
        ".ce-settings .ce-popover--opened"
      );
      return hasToolboxOpen || hasSettingsPopoverOpen;
    };

    // Update z-index based on popover state
    const updateFooterZIndex = () => {
      dashFooter.style.zIndex = isAnyPopoverOpen() ? "0" : "1";
    };

    // Observer for the editor element (toolbox)
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

    // Observer for dynamic settings elements
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.addedNodes.length > 0 ||
          mutation.removedNodes.length > 0
        ) {
          // Check if settings popover was added or removed
          const settingsElement = document.querySelector(".ce-settings");
          if (settingsElement) {
            // Observer for the settings popover
            const settingsObserver = new MutationObserver((mutations) => {
              updateFooterZIndex();
            });

            settingsObserver.observe(settingsElement, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ["class"],
            });

            // Store the observer for cleanup
            if (ejInstance.current) {
              ejInstance.current.settingsObserver = settingsObserver;
            }
          }
        }
      });
    });

    // Start observing
    editorObserver.observe(editorElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return { editorObserver, bodyObserver };
  };

  const initEditor = useCallback(() => {
    try {
      const editor = new EditorJS({
        holder: "editorjs",
        onReady: () => {
          ejInstance.current = editor;
          // Start observing after editor is ready
          const observers = observeEditorElements();
          // Store observer references for cleanup
          ejInstance.current.observers = observers;
        },
        readOnly: readMode,
        data: initialDataRef.current || { blocks: [] },
        onChange: async () => {
          if (!readMode) {
            let content = await editor.saver.save();

            if (content.blocks.length === 0) {
              content.blocks.push({
                type: "paragraph",
                data: {
                  text: "Empty",
                },
              });
            } else {
              const lastBlock = content.blocks[content.blocks.length - 1];
              if (
                lastBlock.type !== "paragraph" ||
                !lastBlock.data.text.trim()
              ) {
                content.blocks.push({
                  type: "paragraph",
                  data: {
                    text: "",
                  },
                });
              }
            }

            onChange(content);
          }
        },
        tools: EDITOR_JS_TOOLS,
        minHeight: 20,
      });

      const handleResize = () => {
        if (ejInstance.current) {
          ejInstance.current.render();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
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

    // Enhanced cleanup
    return () => {
      if (ejInstance.current) {
        // Disconnect all observers
        if (ejInstance.current.observers) {
          ejInstance.current.observers.editorObserver.disconnect();
          ejInstance.current.observers.bodyObserver.disconnect();
        }
        if (ejInstance.current.settingsObserver) {
          ejInstance.current.settingsObserver.disconnect();
        }
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [initEditor]);

  return <div id="editorjs" className="editor-container"></div>;
};

export default EditorComponent;
