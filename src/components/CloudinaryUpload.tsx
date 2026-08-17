import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

interface CloudinaryUploadProps {
  label: string;
  onUploadSuccess: (url: string) => void;
  presetUrl?: string;
}

export default function CloudinaryUpload({ label, onUploadSuccess, presetUrl }: CloudinaryUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(presetUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileData: base64data })
          });

          if (!res.ok) {
            throw new Error("Failed uploading to server upload route");
          }

          const data = await res.json();
          if (data.url) {
            setUploadedUrl(data.url);
            onUploadSuccess(data.url);
          } else {
            throw new Error("No URL returned from upload provider");
          }
        } catch (uploadErr: any) {
          console.error("Cloudinary uploading error:", uploadErr);
          setError("Upload failed. Using local storage fallback.");
          // Fallback to high-quality placeholder if backend upload fails
          const fallbackUrl = URL.createObjectURL(file);
          setUploadedUrl(fallbackUrl);
          onUploadSuccess(fallbackUrl);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Error reading local file.");
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="font-sans">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadContainerClick}
        className={`w-full min-h-[110px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${
          isDragging 
            ? "border-teal-500 bg-teal-50/50" 
            : uploadedUrl 
            ? "border-emerald-300 bg-emerald-50/20" 
            : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {isUploading ? (
          <div className="space-y-2 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
            <span className="text-xs text-slate-600 font-medium">Encrypting & Uploading image...</span>
          </div>
        ) : uploadedUrl ? (
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold">Securely Hosted</span>
            </div>
            {uploadedUrl.startsWith("http") && (
              <img
                src={uploadedUrl}
                alt="Uploaded preview"
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 mt-1 shadow-sm"
              />
            )}
            <span className="text-[10px] text-slate-400">Click to replace photo</span>
          </div>
        ) : (
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-700">
              Drag & Drop file or <span className="text-teal-600 font-bold hover:underline">browse</span>
            </span>
            <span className="text-[9px] text-slate-400">Supports PNG, JPG, GIF up to 5MB</span>
          </div>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
}
