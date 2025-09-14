import React from "react";

interface Props {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<Props> = ({ onFileUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return <input type="file" onChange={handleChange} />;
};

export default FileUploader;

