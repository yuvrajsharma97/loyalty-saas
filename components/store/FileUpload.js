"use client";
import { useState, useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FileUpload({
  value,
  onChange,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  className = ""
}) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.size <= maxSize) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreview(result);
        onChange?.(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const clearFile = () => {
    setPreview(null);
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ?
      <div className="relative inline-block">
          <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-xl border border-[#D0D8C3]/40" />
        
          <button
          type="button"
          onClick={clearFile}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          aria-label="Remove image">
            <X className="w-4 h-4" />
          </button>
        </div> :

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver ?
        "border-[#014421] bg-[#014421]/5" :
        "border-[#D0D8C3]/40 hover:border-[#D0D8C3]"}`
        }>
          <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop an image, or
          </p>
          <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      }

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden" />
      

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
      </p>
    </div>);

}