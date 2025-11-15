"use client";

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Image from "next/image";

interface MultipleImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export default function MultipleImageUpload({
  values,
  onChange,
  disabled = false,
  maxImages = 5,
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (values.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
    toast.success("Image removed");
  };

  const canAddMore = values.length < maxImages;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isUploading || !canAddMore}
        className="hidden"
      />

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Images */}
        {values.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden group"
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Add More Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            ) : (
              <>
                <PlusIcon className="h-8 w-8 text-neutral-400" />
                <p className="text-xs font-medium text-neutral-600">
                  Add Image
                </p>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        {values.length} / {maxImages} images • PNG, JPG, WEBP up to 5MB each
      </p>
    </div>
  );
}
