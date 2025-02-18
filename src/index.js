import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { StateInspector, useState } from "reinspect";
import { saveAs } from "file-saver";
import { changeDpiBlob } from "changedpi";
import Viewer from "react-viewer";
import FileInput from "./FileInput";
import { hasFile, bytesToSize, compressImage } from "./utils/common";
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
  const [fileName, setFileName] = useState("", "fileName");
  const [file, setFile] = useState(null, "file");
  const [compressedFile, setCompressedFile] = useState(null, "compressedFile");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("", "imagePreviewUrl");

  // Params from inputs
  const [hasParams, setHasParams] = useState(false);
  const [maxWidth, setMaxWidth] = useState(3500, "Output maxWidth");
  const [maxHeight, setMaxHeight] = useState(2500, "Output maxHeight");
  const [dpi, setDpi] = useState(72, "Output DPI");

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
    compressImage(
      compressedFile || file,
      { maxWidth, maxHeight },
      setCompressedFile
    );
  }, [compressedFile, file, maxHeight, maxWidth]);

  useEffect(() => {
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
            <img
              src={imagePreviewUrl}
              alt={file.name}
              onClick={() => setModalIsOpen(!modalIsOpen)}
            />
            <Viewer
              visible={modalIsOpen}
              onClose={() => setModalIsOpen(!modalIsOpen)}
              images={[{ src: imagePreviewUrl, alt: "" }]}
            />
          </div>
          <div>
            <button
              onClick={async () => {
                const compressedChangedDpiFile = await changeDpiBlob(
                  compressedFile,
                  dpi
                );
                saveAs(compressedChangedDpiFile, compressedFile.name);
              }}
            >
              Download
            </button>
            <button onClick={clearFiles}>Clear</button>
          </div>
        </div>
      ) : null}
      <div className="params">
        {hasParams ? (
          <>
            <div>
              <label>Макс ширина</label>
              <input
                type="tel"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
              />
            </div>
            <div>
              <label>Макс длина</label>
              <input
                type="tel"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
              />
            </div>
            <div>
              <label>DPI</label>
              <input
                type="tel"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
              />
              <label>изменяется только при загрузке (download) файла</label>
            </div>
          </>
        ) : (
          <span onClick={() => setHasParams(true)}>Показать параметры</span>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <StateInspector name="App">
      <App />
    </StateInspector>
  </React.StrictMode>,
  document.getElementById("root")
);
