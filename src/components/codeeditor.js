import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

// codemirror components
import { useCodeMirror } from "@uiw/react-codemirror";

// import languages
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";

// import themes
import { githubDark } from "@uiw/codemirror-theme-github";
import { toast } from "react-hot-toast";

var qs = require("qs");

const Editor = ({ sendHandler, roomId, onCodeChange, code, lang }) => {
  const history = useLocation();
  const location = useLocation();
  const userName = location?.state?.userName;
  const [theme, setTheme] = useState(githubDark);
  const [selectValue, setSelectValue] = useState("javascript");
  const [extensions, setExtensions] = useState([javascript()]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [tc, setTc] = useState(true);
  const thememap = new Map();
  const langnMap = new Map();

  const editorRef = useRef(null);
  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    extensions,
    value: code,
    theme: "dark",
    editable: true,
    height: `55vh`,
    width: `55vw`,
    basicSetup: {
      foldGutter: false,
      dropCursor: false,
      indentOnInput: false,
    },
    options: {
      autoComplete: true,
    },
    style: {
      borderRadius: `10px`,
    },
    onChange: (value) => {
      onCodeChange(value);
      sendHandler(3, { value });
    },
  });

  const themeInit = () => {};

  const langInit = () => {
    langnMap.set("java", java);
    langnMap.set("cpp", cpp);
    langnMap.set("javascript", javascript);
    langnMap.set("python", python);
  };

  const handleThemeChange = (event) => {
    setTheme(thememap.get(event.target.value));
  };

  const handleLanguageChange = (event) => {
    setExtensions([langnMap.get(event.target.value)()]);

    sendHandler(4, { newLang: event.target.value });
    setSelectValue(event.target.value);
  };

  themeInit();
  langInit();

  function langCode(e) {
    if (e == "javascript") return "js";
    else if (e == "python") return "py";
    return e;
  }

  useEffect(() => {
    if (!editorRef.current) {
      alert("error loading editor");
      history("/");
    }
    if (editorRef.current) {
      setContainer(editorRef.current);
    }
  }, [editorRef.current]);

  useEffect(() => {
    if (lang != selectValue && lang) {
      setSelectValue(lang);
      setExtensions([langnMap.get(lang)()]);
    }
  }, [lang]);

  const compile = (e) => {
    e.preventDefault();
    var data = qs.stringify({
      code: code,
      language: langCode(selectValue),
      input: input,
    });
    var config = {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    };
    fetch("https://api.codex.jaagrav.in", config)
      .then((res) => res.json())
      .then((data) => {
        if (data["error"].length == 0) {
          setTc(true);
          toast.success("compiled sucessfully");
          setOutput(data["output"]);
        } else {
          setTc(false);
          toast.error("compilation error");
          setOutput(data["error"]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  const handleOutputChange = (e) => {
    setOutput(e.target.value);
  };

  return (
    <div className="">
      <div ref={editorRef} className=" text-md  w-full relative">
        <select
          className=" w-[140px]  bg-gray-900 text-emerald-400  p-1 rounded-md cursor-pointer border border-white absolute top-1  right-2 z-20"
          onChange={handleLanguageChange}
          value={selectValue}
        >
          <option default className="p-2 text-white" value={"javascript"}>
            JavaScript
          </option>
          <option className="text-white" value={"java"}>
            Java
          </option>
          <option className="text-white" value={"cpp"}>
            C++
          </option>
          <option className="text-white" value={"python"}>
            Python
          </option>
          <option className="text-white" value={"c"}>
            C
          </option>
        </select>
        <button
          className="run flex gap-2 absolute font-semibold hover:scale-105 bottom-0 z-20 right-0 px-4  py-2 rounded-md m-2 bg-green-500  text-white"
          onClick={compile}
        >
          Run
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-play"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2 pb-2">
        <div className="w-full h-full" style={{ backgroundColor: "#282a36" }}>
          <pre className="px-2 py-1 text-xl leading-relaxed text-white">
            Input
          </pre>
          <textarea
            className="flex flex-row items-start justify-center bg-transparent p-2  w-full text-white h-40"
            value={input}
            onChange={handleInputChange}
          />
        </div>
        <div
          className={` px-2 py-2 text-white`}
          style={{ backgroundColor: "#282a36" }}
        >
          <pre className=" text-xl leading-relaxed text-white">Output</pre>
          <textarea
            value={output}
            onChange={handleOutputChange}
            className={`${
              tc ? "ctxt" : "etxt"
            } flex flex-row items-center justify-center w-full h-36 text-white bg-transparent`}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
