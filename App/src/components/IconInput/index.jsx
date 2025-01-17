import React from "react";
import "./style.css";

export default function IconInput({ type,icon , placeholder, onChange }) {
  return (
    <div className="icon-input">
      {icon}
      <input type={type} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}
