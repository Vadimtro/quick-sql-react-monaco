import React from "react";

const Data = ({ data, onChange }) => (
  <div>
    <textarea id="dataTextarea" className="data" onChange={onChange}>
      {data}
    </textarea>
  </div>
);

export default Data;
