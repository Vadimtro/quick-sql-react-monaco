import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import FileSaver from "file-saver";

import Data from "./Data";
import Export from "./Export";
import Settings from "./Settings";

//import useDebounce from "./useDebounce";

import { EXAMPLE_DATA } from "./data/example";

import "./styles.css";


function App() {
  const [rawContent, setRawContent] = useState(null);
  //const debouncedContent = useDebounce(rawContent, 500);
  const [renderedContent, setRenderedContent] = useState(null);
  const [editionData, setEditionData] = useState("");
  const [campaignFilename, setCampaignFilename] = useState("template");
  const [renderMJML, setRenderMJML] = useState(true);
  const [renderVTL, setRenderVTL] = useState(true);
 
  const editorRef = useRef(null);

  const onDataChange = (data) => {
    try {
      const json = JSON.parse(data);
      setEditionData(json);
    } catch (error) {
      // console.log('DATA ERROR');
      // console.log(error);
    }
  };

  const onEditorChange = (value) => {
    // console.log("onChange");
    setRawContent(value);
  };

  const onEditorMount = (editor) => {
    // console.log("onMount");
    editorRef.current = editor;
  };

  const onExport = (filename, fileType) => {
    if (!debouncedContent) {
      return;
    }

    let escaped = debouncedContent.replace(
      /(^ *)(#[\S ]+)([\n\r])/gm,
      "$1<mj-raw>$2</mj-raw>$3"
    );
    // console.log(escaped);
    let vtl;
    try {
      vtl = mjml2html(escaped).html;
    } catch (error) {
      console.log("Export error", error);
      return;
    }

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(vtl, `${filename}.vtl`);
    } else {
      const blob = new Blob([vtl], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, `${filename}.vtl`);
    }
  };

  const onCampaignFilenameChange = (event) =>
    setCampaignFilename(event.target.value);


  const example = `
departments /insert 2
  name
  location vc255
  country vc255
  employees /insert 4
     name
     email
     job vc255
     hiredate
     skills /insert 6
         skill vc255 /values C++, Java, APEX, JSON, Javascript, Python, CSS
         proficiency num /check 1, 2, 3, 4, 5 [with 1 being a novice and 5 being a guru]
       
# "schema" : null
# "semantics" : "char"     
# "DV" : false     `;


  function updateOutput() {
    var model=monaco.editor.getModels()[1];
    model.setValue("???");
  }

  return (
    <>
      <div className="d-flex">
        <div className="editor-container">
          <div className="section-titles">QSQL</div>
          <Editor
            className="editor"
            defaultLanguage="html"
            defaultValue={example}
            onChange={onEditorChange}
          />
        </div>
        <div className="editor-container">
          <div className="section-titles">DDL</div>
          <Editor 
            className="editor"
            defaultLanguage="sql"
            defaultValue="select 1 from dual"
            onMount={onEditorMount}
          />
        </div>
      </div>
      <div className="d-flex">
        <div className="section-titles d-flex align-items-center">Data</div>
        <button onClick={updateOutput} className="m-0 p-0">
          Translate to SQL
        </button>
      </div>
      {/*<Data
        data={JSON.stringify(editionData, null, 2)}
        onChange={(event) => onDataChange(event.target.value)}
      />
      <Export
        filename={campaignFilename}
        onChange={onCampaignFilenameChange}
        onExport={() => onExport(campaignFilename, EXPORT_TYPE.CAMPAIGN)}
        exportType="Template"
      />
      <Settings
        renderMJML={renderMJML}
        setRenderMJML={setRenderMJML}
        renderVTL={renderVTL}
        setRenderVTL={setRenderVTL}
  /   >*/}
    </>
  );
}

export default App;
