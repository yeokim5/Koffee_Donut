import React, { useState, useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import CodeTool from "@editorjs/code";

const EDITOR_JS_TOOLS = {
  header: Header,
  list: List,
  embed: Embed,
  code: CodeTool,
};

const EditorComponent = ({ initialData, onChange }) => {
  const ejInstance = useRef();
  const initialDataRef = useRef(initialData);

  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      onReady: () => {
        ejInstance.current = editor;
      },
      autofocus: true,
      data: initialDataRef.current || { blocks: [] },
      onChange: async () => {
        let content = await editor.saver.save();
        onChange(content);
      },
      tools: EDITOR_JS_TOOLS,
    });
  }, [onChange]);

  useEffect(() => {
    if (ejInstance.current === null) {
      initEditor();
    }

    return () => {
      ejInstance?.current?.destroy();
      ejInstance.current = null;
    };
  }, [initEditor]);

  return (
    <div
      id="editorjs"
      className="editor-container"
      style={{ backgroundColor: "white" }}
    ></div>
  );
};

export default EditorComponent;
