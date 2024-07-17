import React, { useState, useEffect, useRef, useCallback } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";

const EDITOR_JS_TOOLS = {
  header: Header,
  list: List,
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
