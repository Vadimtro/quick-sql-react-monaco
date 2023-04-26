import React from "react";

const Settings = ({ renderMJML, renderVTL, setRenderMJML, setRenderVTL }) => {
  const toggleRenderMJML = () => setRenderMJML(!renderMJML);

  const toggleRenderVTL = () => setRenderVTL(!renderVTL);

  return (
    <div>
      <div>
        <input
          type="checkbox"
          id="mjml"
          checked={renderMJML}
          onChange={toggleRenderMJML}
        />
        <label htmlFor="mjml">Render MJML</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="vtl"
          checked={renderVTL}
          onChange={toggleRenderVTL}
        />
        <label htmlFor="mjml">Render VTL</label>
      </div>
    </div>
  );
};

export default Settings;
