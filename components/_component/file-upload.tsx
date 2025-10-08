// src/components/ui/file-upload.tsx
"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { useDropzone } from "@uploadthing/react";


interface FileUploadProps {
  onChange: (file: File) => void;
  accept?: string[];
  maxSize?: number;
  value?: File | null;
}

export function FileUpload({ onChange, accept, maxSize = 4 * 1024 * 1024, value }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > maxSize) {
        alert(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
        return;
      }
      onChange(file);
    }
  }, [onChange, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? Object.fromEntries(accept.map(ext => [ext, []])) : undefined,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          {value.type.startsWith("image/") ? (
            <ImageIcon className="h-10 w-10 text-blue-500" />
          ) : (
            <FileText className="h-10 w-10 text-blue-500" />
          )}
          <div className="flex-1">
            <p className="font-medium">{value.name}</p>
            <p className="text-sm text-gray-500">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {isUploading && <Progress value={progress} className="mt-2" />}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange(null as any)}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the file here"
              : "Drag and drop your file here, or click to browse"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {accept ? `Supported formats: ${accept.join(", ")}` : "Any file type"} • Max size:{" "}
            {maxSize / 1024 / 1024}MB
          </p>
        </div>
      )}
    </div>
  );
}