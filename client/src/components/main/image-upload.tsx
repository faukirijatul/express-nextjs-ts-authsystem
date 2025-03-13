"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { processImage } from "@/lib/image-utils";

interface ImageUploadProps {
  currentImage: string | null;
  onImageChange: (data: { base64: string | null; file: File | null }) => void;
  size?: number; // Size in pixels (square)
  className?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  placeholderText?: string | React.ReactNode;
  disabled?: boolean;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  size = 160, // Default to 160px
  className = "",
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  placeholderText = "Change Photo",
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processed = await processImage(file, { maxSizeMB, allowedTypes });

    if (processed.valid && processed.base64) {
      setPreview(processed.preview);
      onImageChange({
        base64: processed.base64,
        file: processed.file,
      });
    }
  };

  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-full overflow-hidden ${
          !disabled && "cursor-pointer"
        } border-4 border-gray-200 ${className}`}
        onClick={handleImageClick}
        style={sizeStyle}
      >
        {preview ? (
          <Image src={preview} alt="Profile" fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">
              {typeof placeholderText === "string"
                ? placeholderText.charAt(0).toUpperCase()
                : placeholderText}
            </span>
          </div>
        )}
        {!disabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <span className="text-white text-sm">
              {typeof placeholderText === "string"
                ? placeholderText
                : "Change Photo"}
            </span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
