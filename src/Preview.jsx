import React, { useState } from "react";
import pretty from "pretty";

const Preview = ({ html }) => {
  const [currentTab, setCurrentTab] = useState("Preview");

  return (
    <div>
      <div className="section-titles">
        <a href="#" onClick={() => setCurrentTab("Preview")}>
          Preview
        </a>{" "}
        |{" "}
        <a href="#" onClick={() => setCurrentTab("HTML")}>
          HTML
        </a>
      </div>
      <div>
        {currentTab === "Preview" ? (
          <iframe
            className="preview"
            id="previewIframe"
            loading="lazy"
            srcDoc={html}
            title="Edition Preview"
            allowFullScreen
          />
        ) : (
          <div className="preview html">
            <pre>{pretty(html)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
