"use client";

import { useState, type DragEvent, type ReactNode } from "react";

interface PhotoUploadProps {
  label: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  isUploading: boolean;
  error?: string | null;
  onFilesSelected: (files: FileList | null) => void;
  children?: ReactNode;
}

export function PhotoUpload({
  label,
  hint,
  accept = "image/jpeg,image/png,image/webp",
  multiple,
  disabled,
  isUploading,
  error,
  onFilesSelected,
  children,
}: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isDisabled = disabled || isUploading;

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (isDisabled) {
      return;
    }
    onFilesSelected(e.dataTransfer.files);
  }

  return (
    <div className="mb-6 border border-[#E2DFD3] p-4">
      <span className="mb-1 block text-sm font-medium text-[#14211D]">{label}</span>
      {hint && <p className="mb-2 text-xs text-[#5B6B67]">{hint}</p>}
      {children}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDisabled) {
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex min-h-[96px] w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors duration-150 ${
          isDragOver ? "border-[#0F766E] bg-[#0F766E]/5" : "border-[#E2DFD3]"
        } ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#0F766E]/50"}`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={isDisabled}
          onChange={(e) => onFilesSelected(e.target.files)}
          className="sr-only"
        />
        {isUploading ? (
          <span className="flex items-center gap-2 text-sm text-[#5B6B67]">
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0F766E] border-t-transparent"
              aria-hidden
            />
            Uploading&hellip;
          </span>
        ) : (
          <>
            <span className="text-sm font-medium text-[#0F766E]">Click or drag photos here</span>
            <span className="text-xs text-[#5B6B67]">JPEG, PNG or WEBP, up to 5MB</span>
          </>
        )}
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
