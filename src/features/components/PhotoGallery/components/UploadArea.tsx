import React from "react";

interface UploadAreaProps {
  onUpload?: (files: FileList | null) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpload?.(event.target.files);
  };

  return (
    <label className="flex pg-upload-area ">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <div className="pg-upload-icon">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div>
        <div className="pg-upload-text">上传照片</div>
        <div className="pg-upload-hint">JPG / PNG </div>
      </div>
      <div className="pg-upload-action">点击上传</div>
    </label>
  );
};
