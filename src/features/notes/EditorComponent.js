import React, { useState, useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import CodeTool from "@editorjs/code";

const EDITOR_JS_TOOLS = {
  header: Header,
  list: List,
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        coub: true,
      },
    },
  },
};

const EditorComponent = ({ initialData, onChange, readMode }) => {
  const ejInstance = useRef();
  const initialDataRef = useRef(initialData);
  console.log("READMODE", readMode);

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
