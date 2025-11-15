// app/components/ImageUploader.tsx
"use client";

import React, { useState } from "react";

interface ImageUploaderProps {
  onUpload: (url: string) => void; // ← CHANGED FROM onUploadComplete
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const previewURL = URL.createObjectURL(file);
    setPreview(previewURL);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUpload(data.url); // ← NOW MATCHES PROP
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-yellow-400 transition">
      <label
        htmlFor="file-upload"
        className="cursor-pointer text-gray-700 font-medium flex flex-col items-center gap-2"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-lg shadow-md"
          />
        ) : (
          <>
            <span className="text-5xl text-gray-400">Camera</span>
            <span>Click to upload product image</span>
          </>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploading && (
        <p className="mt-3 text-sm text-yellow-600 animate-pulse">
          Uploading...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
