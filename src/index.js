import React, { useState } from "react";
import ReactDOM from "react-dom";
import Compressor from "compressorjs";
import { saveAs } from "file-saver";

function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB"];
  if (bytes === 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return { size: Math.round(bytes / Math.pow(1024, i), 2), type: sizes[i] };
}

const FileInput = ({ value, onChange }) => (
  <input type="file" name="file[]" value={value} onChange={onChange} multiple />
);

const FileSize = ({ file }) => {
  if (typeof file.name !== "string") {
    return <div>No file.</div>;
  }
  const { size, type } = bytesToSize(file.size);
  return (
    <div style={{ color: type === "MB" && size > 5 ? "red" : "green" }}>
      Current value: {size} {type}.
    </div>
  );
};

const App = () => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState({});
  const [compressedFile, setCompressedFile] = useState(null);

  const handleChange = ({ files, value }) => {
    setFile(files[0]);
    setFileName(value);
  };

  const handleCompress = () => {
    const currentFile = compressedFile || file;
    const { size, type } = bytesToSize(currentFile.size);

    if (type === "MB" && size <= 5) {
      return;
    }

    const img = new Image();
    img.src = window.URL.createObjectURL(currentFile);
    img.onload = function () {
      new Compressor(currentFile, {
        maxWidth: img.width * 0.75,
        maxHeight: img.height * 0.75,
        success(result) {
          setCompressedFile(result);
        },
      });
    };
  };

  return (
    <>
      <FileInput value={fileName} onChange={(e) => handleChange(e.target)} />
      <p>оригинальный файл:</p>
      <FileSize file={file} />
      {fileName && (
        <button onClick={() => handleCompress()}>
          Сжать файл (можно несколько раз)
        </button>
      )}
      {compressedFile ? (
        <>
          <p>сжатый файл:</p>
          <FileSize file={compressedFile} />
          <button onClick={() => saveAs(compressedFile, compressedFile.name)}>
            Download
          </button>
        </>
      ) : null}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
