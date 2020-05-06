import React from "react";

export const FileInput = ({ value, onChange }) => (
  <input
    type="file"
    name="file[]"
    value={value}
    onChange={onChange}
    accept="image/x-png,image/jpeg"
    multiple
  />
);
