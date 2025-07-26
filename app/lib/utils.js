import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function generateLightColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 51) + 50; // 50 to 100
  const l = Math.floor(Math.random() * 21) + 70; // 70 to 90

  return { h, s, l };
}

export function parseHSL(hslString) {
  if (!hslString) return {};
  const [h, s, l] = hslString
    .replace(/hsl|\(|\)|\s/g, "")
    .split(",")
    .map(parseFloat);

  return { h, s, l };
}

export const cleanHeaders = (rawHeaders) => {
  return rawHeaders.map(
    (header, index) => header?.toString().trim() || `Column ${index + 1}`,
  );
};

// import/export csv Utils
export const handleFileUpload = async (formData, endpoint) => {
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.error || "Failed to upload file");
  }

  return response;
};

export const parseCSVFile = (file, onSuccess) => {
  Papa.parse(file, {
    complete: (result) => {
      if (result.data && result.data.length > 0) {
        onSuccess(cleanHeaders(result.data[0]), result.data);
      } else {
        throw new Error("No data found in csv file");
      }
    },
    error: (err) => {
      throw err;
    },
    header: false,
  });
};

export const handleFileParsing = (file, onSuccess) => {
  const fileType = file.name.split(".").pop().toLowerCase();

  switch (fileType) {
    case "csv":
      parseCSVFile(file, onSuccess);
      break;
    case "xlsx":
    case "xls":
      throw new Error(
        "Unsupported file type. Please Export your excel sheet to CSV",
      );
      break;
    default:
      throw new Error("Unsupported file type. Please upload a CSV file only");
  }
};

/**
 * Exports JSON data to a CSV file and triggers download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file without extension
 * @returns {void}
 */
export const exportToCSV = (data, filename) => {
  try {
    const defaultOptions = {
      quotes: true, // Include quotes around fields
      skipEmptyLines: true,
      delimiter: ",",
    };

    const csvString = Papa.unparse(data, defaultOptions);

    // Create blob and download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename + ".csv");
      return;
    }

    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};
