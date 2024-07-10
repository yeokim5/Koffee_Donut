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

const EditorComponent = ({ onChange, initialData }) => {
  const [editor, setEditor] = useState(null);
  const initialDataRef = useRef(initialData);

  console.log("Editor initial", { initialData });

  useEffect(() => {
    if (!editor) {
      const newEditor = new EditorJS({
        holder: "editorjs",
        onReady: () => {
          // The editor is ready
        },
        autofocus: true,
        data: initialDataRef.current || { blocks: [] },
        onChange: async () => {
          const content = await newEditor.save();
          onChange(content);
          console.log(content);
        },
        tools: EDITOR_JS_TOOLS,
      });

      setEditor(newEditor);
    }

    return () => {
      if (editor) {
        // editor.destroy();
      }
    };
  }, [onChange]);

  return (
    <div
      id="editorjs"
      className="editor-container"
      style={{ backgroundColor: "white" }}
    />
  );
};

export default EditorComponent;

// const EditorComponent = () => {
//   const ejInstance = useRef();

//   const initEditor = () => {
//     const editor = new EditorJS({
//       holder: "editorjs",
//       onReady: () => {
//         ejInstance.current = editor;
//       },
//       autofocus: true,
//       data: DEFAULT_INITIAL_DATA,
//       onChange: async () => {
//         let content = await editor.saver.save();

//         console.log(content);
//       },
//       tools: {
//         header: Header,
//       },
//     });
//   };

//   // This will run only once
//   useEffect(() => {
//     if (ejInstance.current === null) {
//       initEditor();
//     }

//     return () => {
//       ejInstance?.current?.destroy();
//       ejInstance.current = null;
//     };
//   }, []);

//   return (
//     <>
//       <div id="editorjs"></div>
//     </>
//   );
// };

// export default EditorComponent;
