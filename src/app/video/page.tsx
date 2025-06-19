"use client";

import React from "react";
import FileUpload from "@/app/components/FileUpload";
import { toast } from "sonner";

const Page = () => {
  const handleUploadSuccess = (response: any) => {
    toast.success("File uploaded successfully", {
      description: `File URL: ${response.url}`,
    });
    console.log("Upload response:", response);
  };

  const handleUploadProgress = (progress: number) => {
    console.log(`Upload progress: ${progress}%`);
  };

  return (
    <div>
      <FileUpload
        onSuccess={handleUploadSuccess}
        onProgress={handleUploadProgress}
        // fileType="video" // or "video" based on your needs
      />
      
    </div>
  );
};

export default Page;