import { useState, ChangeEvent } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2, Upload, File, ArrowLeft } from "lucide-react";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FileData {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  projectId: string;
}

interface FileUploadProps {
  projectId: string;
  onComplete: (fileData: FileData) => void;
  onBack: () => void;
  onClose: () => void;
}

const FileUploadComponent = ({
  projectId,
  onComplete,
  onBack,
  onClose,
}: FileUploadProps) => {
  // File data state
  const [fileData, setFileData] = useState<FileData>({
    filename: "",
    path: "",
    mimetype: "",
    size: 0,
    projectId: projectId,
  });

  // UI states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [_, setPreview] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit");
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF, DOC, or DOCX files are allowed");
      return;
    }

    // Set file data
    setSelectedFile(file);
    setFileData({
      ...fileData,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });

    // Create preview for document icons
    if (file.type === "application/pdf") {
      setPreview("pdf");
    } else {
      setPreview("doc");
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(undefined);
    setIsUploaded(false);
    setFileData({
      ...fileData,
      filename: "",
      path: "",
      mimetype: "",
      size: 0,
    });
    setError(null);
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Use the preset name from your example
      formData.append(
        "upload_preset",
        "Digital_repository_for_final_year_projects"
      );

      // Make the API call to Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/fhareed/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error details:", errorData);
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      // Parse the response to get the uploaded file URL
      const responseData = await response.json();

      // Update fileData with the secure URL from Cloudinary
      setFileData((prevData) => ({
        ...prevData,
        path: responseData.secure_url,
      }));

      setIsUploaded(true);
      toast("File uploaded successfully!");
    } catch (err) {
      setError("Failed to upload file to Cloudinary. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission with the uploaded file data
  const handleSubmit = () => {
    if (!isUploaded || !fileData.path) {
      setError("Please upload a file to Cloudinary first");
      return;
    }

    // Call the onComplete callback with the file data
    onComplete(fileData);
  };

  // Get appropriate file icon based on type
  const getFileIcon = () => {
    return <File className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      <div>
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">
            Project ID:{" "}
            <span className="font-mono font-medium">{projectId}</span>
          </p>
        </div>

        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <div className="mt-3 flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="mx-auto relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, or DOCX up to 20MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon()}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isUploaded ? (
              <Button
                onClick={uploadToCloudinary}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload to Cloudinary</span>
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-green-50 text-green-800 rounded-md p-3 text-sm">
                File successfully uploaded to Cloudinary
              </div>
            )}
          </div>
        )}

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      <DialogFooter className="pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>

        <div className="flex gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={!isUploaded || isUploading}
            className="flex items-center gap-2"
          >
            <span>Submit</span>
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
};

export default FileUploadComponent;
