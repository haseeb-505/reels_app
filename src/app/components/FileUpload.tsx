"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video" | "video/mp4";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string | null>("");

  const validateFile = (file: File) => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return false;
    }
    if (fileType === "image" && !file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected");
      setSelectedFile(null);
      return;
    }

    if (!validateFile(file)) {
      toast.error(error || "Invalid file");
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
  if (!selectedFile) {
    toast.error("No file selected");
    return;
  }

  if (!title?.trim()) { // Add null check for title
    toast.error("Please enter a title");
    return;
  }
  
  setUploading(true);
  setError(null);
  
  try {
    const fileType = selectedFile.type;
    console.log("Type of selected file is: ", fileType);

    const authRes = await fetch("/api/auth/imagekit-auth");
    if (!authRes.ok) {
      throw new Error("Failed to fetch ImageKit auth");
    }
    const auth = await authRes.json();

    const response = await upload({
      file: selectedFile,
      fileName: selectedFile.name,
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
      signature: auth.signature,
      expire: auth.expire,
      token: auth.token,
      onProgress: (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = (event.loaded / event.total) * 100;
          onProgress(Math.round(percent));
          setProgress(Math.round(percent));
        }
      },
    });

    const postData = {
      fileUrl: response.url,
      fileType,
      fileName: selectedFile.name,
    };
    console.log("Sending to /api/video:", postData);

    // Save the file URL to your backend
    const saveResponse = await fetch("/api/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          fileUrl: response.url,
          fileType,
          fileName: selectedFile.name,
          title,
      }),
    });

    console.log("Save response is: ", saveResponse);

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json(); // Get the response body
      console.error("Save response error:", errorData);
      throw new Error(errorData.message || "Failed to save file metadata");
    }

    // Only clear on successful upload
    setSelectedFile(null);
    setTitle("");
    setProgress(null);
    onSuccess(response);
    toast.success("File uploaded successfully");
  } catch (error: any) {
    console.error("Upload failed:", error);
    const errorMessage =
      error instanceof ImageKitAbortError
        ? "Upload aborted"
        : error instanceof ImageKitInvalidRequestError
        ? "Invalid upload request"
        : error instanceof ImageKitServerError
        ? "Server error during upload"
        : error instanceof ImageKitUploadNetworkError
        ? "Network error during upload"
        : error.message || "Failed to upload file";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-500 rounded-lg shadow-md p-8">
        <h1 className="text-2xl text-white font-bold text-center mb-6">
          File Upload
        </h1>
        {/* file title here */}
        <div>
          <label
            htmlFor="video-title"
            className="block text-white text-sm font-medium mb-1"
          >
            Title
          </label>
          <input
            id="file-title"
            title="File Title"
            type="text"
            placeholder="file title here"
            required
            className="bg-white text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>
        {/* file here */}
        <div className="mt-3">
          <label
            htmlFor="file-upload"
            className="block text-white text-sm font-medium mb-1"
          >
            Upload  File here
          </label>
          <input
            id="file-upload"
            title="Upload file"
            type="file"
            accept={fileType === "video" ? "video/*" : "image/*"}
            className="bg-white text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleFileChange}
            disabled={uploading}
            aria-label={`Upload ${fileType === "video" ? "video" : "image"} file`}
          />
          {selectedFile && (
            <div className="mt-2 text-white">
              Selected: {selectedFile.name}
            </div>
          )}
          {uploading && (
            <div className="mt-2 text-white">
              Uploading... {progress !== null && `${progress}%`}
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-300" role="alert">
              {error}
            </div>
          )}
        </div>
        {progress !== null && (
          <div className="mt-4">
            <progress
              value={progress}
              max={100}
              className="w-full h-2 rounded"
            ></progress>
          </div>
        )}
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={uploading || !selectedFile}
          className="text-center mt-3 w-full p-2 rounded-full bg-blue-600 hover:bg-blue-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Upload selected file"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;