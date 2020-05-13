import Compressor from "compressorjs";
import { isNil } from "lodash";

export const hasFile = (file) => {
  if (isNil(file)) {
    return false;
  }
  return typeof file.name === "string" && file.size > 0;
};

export const bytesToSize = (bytes) => {
  var sizes = ["Bytes", "KB", "MB"];
  if (bytes === 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return { size: (bytes / Math.pow(1024, i)).toFixed(1), type: sizes[i] };
};

// For typical landscape image
const getMaxDimension = (condition, maxWidth, maxHeight) =>
  condition ? maxWidth : maxHeight;

const getSmallDimension = (maxWidth, maxHeight) =>
  maxWidth < maxHeight ? maxWidth : maxHeight;

export const compressImage = (file, { maxWidth, maxHeight }, callback) => {
  if (file.size <= 2 * 1e6) {
    return callback(file);
  }

  const img = new Image();
  img.src = window.URL.createObjectURL(file);
  img.onload = function () {
    const isLandscape = img.width > img.height;
    const isSquare = img.width === img.height;

    new Compressor(file, {
      maxWidth: isSquare
        ? getSmallDimension(maxWidth, maxHeight)
        : getMaxDimension(isLandscape, maxWidth, maxHeight),
      maxHeight: isSquare
        ? getSmallDimension(maxWidth, maxHeight)
        : getMaxDimension(!isLandscape, maxWidth, maxHeight),
      success(result) {
        callback(result);
      },
    });
  };
};
