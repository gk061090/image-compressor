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

const getQuality = (fileSize) => (fileSize <= 2 * 1e6 ? 1 : 0.8);

export const compressImage = (file, { maxWidth, maxHeight }, callback) => {
  const img = new Image();
  img.src = window.URL.createObjectURL(file);
  img.onload = function () {
    const { width, height } = img;
    const isLandscape = width > height;
    const isSquare = width === height;

    // prepared max width and height
    const maxW = isSquare
      ? getSmallDimension(maxWidth, maxHeight)
      : getMaxDimension(isLandscape, maxWidth, maxHeight);
    const maxH = isSquare
      ? getSmallDimension(maxWidth, maxHeight)
      : getMaxDimension(!isLandscape, maxWidth, maxHeight);

    // return w/o compress
    if (file.size <= 2 * 1e6 && width <= maxWidth && height <= maxHeight) {
      return callback(file);
    }

    new Compressor(file, {
      quality: getQuality(file.size),
      maxWidth: maxW,
      maxHeight: maxH,
      success(result) {
        callback(result);
      },
    });
  };
};
