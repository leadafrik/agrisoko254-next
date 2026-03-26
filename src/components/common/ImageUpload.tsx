"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onImagesChange, maxFiles = 5 }: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    onImagesChange(accepted.slice(0, maxFiles));
  }, [onImagesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-terra-400 bg-terra-50" : "border-stone-300 hover:border-terra-300"}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2 text-stone-500">
        <p className="text-3xl">📷</p>
        <p className="font-semibold text-stone-700">{isDragActive ? "Drop images here..." : "Upload images"}</p>
        <p className="text-sm">Drag & drop images here or click to select</p>
        <p className="text-xs text-stone-400">Up to {maxFiles} images · JPG, PNG, GIF · Max 5MB each</p>
      </div>
    </div>
  );
}
