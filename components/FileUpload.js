import React, { useRef } from "react";
import styles from "../styles/FileUpload.module.css";

const FileUpload = ({ onUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          onUpload(jsonData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file. Please try again.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.fileUpload}>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className={styles.uploadButton}
      >
        Choose JSON File
      </button>
    </div>
  );
};

export default FileUpload;
