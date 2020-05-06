import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { saveAs } from "file-saver";
import FileInput from "./FileInput";
import { hasFile, bytesToSize, compressImage } from "./utils";
import "./style.scss";

const FileSize = ({ file }) => {
  const { size, type } = bytesToSize(file.size);
  return (
    <div style={{ color: file.size <= 2 * 1e6 ? "green" : "red" }}>
      Размер: {size} {type}.
    </div>
  );
};

const App = () => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const handleChange = ({ files, value }) => {
    setFile(files[0]);
    setFileName(value);
    //clear
    setCompressedFile(null);
    setImagePreviewUrl("");
  };

  const clearFiles = () => {
    setFile({});
    setFileName("");
    setCompressedFile(null);
    setImagePreviewUrl("");
  };

  const handleCompress = useCallback(() => {
    compressImage(compressedFile || file, setCompressedFile);
  }, [compressedFile, file]);

  useEffect(() => {
    // console.log(file && file.in("size"));
    if (!hasFile(file)) {
      return;
    }
    handleCompress();
  }, [file, handleCompress]);

  useEffect(() => {
    if (!compressedFile) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreviewUrl(reader.result);
    reader.readAsDataURL(compressedFile);
  }, [compressedFile]);

  return (
    <div className="container">
      <FileInput value={fileName} onChange={(e) => handleChange(e.target)} />
      {hasFile(file) && (
        <div className="files">
          <div className="file">
            <span>оригинальный файл:</span>
            <FileSize file={file} />
          </div>
          {hasFile(compressedFile) && (
            <div className="file">
              <span>сжатый файл:</span>
              <FileSize file={compressedFile} />
            </div>
          )}
        </div>
      )}

      {imagePreviewUrl ? (
        <div className="result">
          <div className="preview">
            <img src={imagePreviewUrl} alt={file.name} />
          </div>
          <div>
            <button onClick={() => saveAs(compressedFile, compressedFile.name)}>
              Download
            </button>
            <button onClick={clearFiles}>Clear</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
