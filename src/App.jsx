//import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

import "./styles.css";

import {QsqlLang, parse_errors} from "./QsqlLang"

const qsql= require('quick-ddl');


function App() {
  //QsqlLang();

  //const editorRef = useRef(null);

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

  const onEditorChange = (value) => {
    const errors = parse_errors(value);
    let markers = [];
    for( var i = 0; i < errors.length; i++ ) {
      markers.push({
        startLineNumber: errors[i].from.line,
        startColumn:     errors[i].from.ch,
        endLineNumber:   errors[i].to.line,
        endColumn:       errors[i].to.ch,
        message:         errors[i].message,
        severity: monaco.MarkerSeverity.Error
      });
    }
    const model0=monaco.editor.getModels()[0];
    monaco.editor.setModelMarkers(model0, "owner", markers);
    //console.log("onChange");
    //console.log(value);
  };


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
    var model0=monaco.editor.getModels()[0];
    var model1=monaco.editor.getModels()[1];
    model1.setValue(qsql.ddl.translate(model0.getValue()));
  }

  return (
    <>
      <div className="d-flex">
        <div className="editor-container">
          <div className="section-titles">QSQL</div>
          <Editor
            className="editor"
            defaultLanguage="qsql"
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
            //onMount={onEditorMount}
          />
        </div>
      </div>
      <div className="d-flex">
        <button onClick={updateOutput} className="m-0 p-0">
          Translate to SQL
        </button>
      </div>
    </>
  );
}

export default App;
