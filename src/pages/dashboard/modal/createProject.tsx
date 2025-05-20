import { useState, useEffect, ChangeEvent } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  File,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CollegeWithDepartments } from "@/types/college";
import collegeServices from "@/services/collegeServices";
import { useParams } from "react-router-dom";
import { DepartmentType, RawDepartment } from "@/types/department";
import departmentServices from "@/services/departmentServices";
import { toast } from "sonner";
import { useAuth } from "@/store/useAuth";
import projectServices from "@/services/projectServices";
import { CreateProjectPayload } from "@/types/project";
import { Input } from "@/components/ui/input";
import { filePayloadType } from "@/types/file";
import fileServices from "@/services/fileServices";

interface FormData {
  title: string;
  abstract?: string;
  authorIds: string[];
  supervisor?: {
    id?: string; // For existing supervisor
    name?: string; // For new supervisor
  };
  schoolId: string;
  departmentId: string;
  year: string;
}

interface FileData {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  projectId: string;
}

interface Supervisor {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

const MultiStepFormDialog = () => {
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const messages = [
    "Uploading...",
    "Still working...",
    "Almost there...",
    "Hold tight...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Selection states
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  // const [supervisorState, setSupervisorState] = useState([]);
  const [supervisorId, setSupervisorId] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSupervisorName, setNewSupervisorName] = useState("");
  const { user } = useAuth();
  const { schoolId } = useParams();

  // Form fields for step 1
  const [formData, setFormData] = useState<FormData>({
    title: "",
    abstract: "",
    authorIds: [user?.id ?? ""],
    supervisor: {}, // Empty object instead of separate supervisorId and newSupervisor
    schoolId: `${user?.schoolId}`,
    departmentId: "",
    year: "",
  });

  // Form fields for step 2
  const [fileData, setFileData] = useState<FileData>({
    filename: "",
    path: "",
    mimetype: "",
    size: 0,
    projectId: "",
  });

  // Validation states
  const [validated, setValidated] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);

  // Selected file reference
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch colleges
  const { data: colleges, status: collegeStatus } = useQuery<
    CollegeWithDepartments[]
  >({
    queryKey: ["colleges"],
    queryFn: () => collegeServices.getAllColleges(schoolId as string),
  });

  // Fetch departments based on selected college
  const { data: departments = [], refetch: refetchDepartments } = useQuery<
    DepartmentType[]
  >({
    queryKey: ["departments", collegeId],
    queryFn: async (): Promise<DepartmentType[]> => {
      if (!collegeId) return [];

      const rawData: RawDepartment[] =
        await departmentServices.getAllDepartments(
          schoolId as string,
          collegeId
        );

      return rawData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        projects: dept._count?.projects || 0,
        image: undefined,
      }));
    },
    enabled: !!collegeId, // Only run query when collegeId is available
  });

  // Fetch supervisors based on selected department
  const { data: supervisors = [], refetch: refetchSupervisors } = useQuery<
    Supervisor[]
  >({
    queryKey: ["supervisors", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];

      const response = await departmentServices.getAllSupervisors(departmentId);
      return response?.supervisors || [];
    },
    enabled: !!departmentId, // Only run query when departmentId is available
  });

  // Create a project
  const { mutateAsync: createProject, status: createProjectStatus } =
    useMutation({
      mutationFn: async (payload: CreateProjectPayload) => {
        const response = await projectServices.createProject(
          payload,
          schoolId as string
        );
        return response;
      },
      onSuccess: (data) => {
        if (data) {
          toast.success("Project created successfully!");
        } else {
          toast.error("Failed to create project. Please try again.");
        }
      },
      onError: () => {
        toast.error("Failed to create project. Please try again.");
      },
    });

  useEffect(() => {
    if (createProjectStatus === "pending") {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 5000); // update every 5 seconds
      return () => clearInterval(interval); // cleanup on unmount or when status changes
    }
  }, [createProjectStatus, messages.length]);

  // Create a file
  const { mutate: fileUpload, status: fileStatus } = useMutation({
    mutationFn: async (payload: filePayloadType) => {
      const response = await fileServices.createFile(payload);
      return response;
    },
    onSuccess: () => {
      setIsComplete(true);
      toast.success("File uploaded successfully!");
    },
    onError: () => {
      toast.error("Failed to upload file. Please try again.");
    },
  });

  // Reset department and supervisor selections when college changes
  useEffect(() => {
    if (collegeId) {
      setDepartmentId("");
      setSupervisorId("");
      refetchDepartments();
    }
  }, [collegeId, refetchDepartments]);

  // Reset supervisor selection when department changes
  useEffect(() => {
    if (departmentId) {
      setSupervisorId("");
      refetchSupervisors();

      // Update formData with selected departmentId
      setFormData((prev) => ({
        ...prev,
        departmentId: departmentId,
      }));
    }
  }, [departmentId, refetchSupervisors]);

  // Update formData when supervisorId changes
  useEffect(() => {
    if (supervisorId) {
      setFormData((prev) => ({
        ...prev,
        supervisorId: supervisorId,
      }));
    }
  }, [supervisorId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form if dialog closes without completion
      if (!isComplete) {
        handleReset();
      }
    }
  }, [isOpen, isComplete]);

  // Validate step 1 form
  
  useEffect(() => {
    const isValid =
      formData.title.trim() !== "" &&
      formData.authorIds.length > 0 &&
      (formData.supervisor?.id || formData.supervisor?.name) &&
      formData.schoolId !== "" &&
      formData.departmentId !== "" &&
      formData.year !== "";

    setValidated(Boolean(isValid));
  }, [formData]);

  // Handle field changes for step 1
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "year" ? parseInt(value, 10) : value,
    });
  };

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
      "application/doc",
      "application/docx",
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
      formData.append("upload_preset", "final_year_projects");

      // Make the API call to Cloudinary
      const response = await fetch(`${import.meta.env.VITE_CLOUDINARY_URL}`, {
        method: "POST",
        body: formData,
      });

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
      toast.success("File uploaded successfully!");
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);

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

  const toggleCreateMode = () => {
    setShowCreateNew(!showCreateNew);
    setSupervisorId(""); // Clear selected supervisor when switching modes
    setNewSupervisorName(""); // Clear input when switching back
  };

  // When selecting an existing supervisor
  const handleSelectSupervisor = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      supervisor: {
        id,
        name: undefined, // Clear any new supervisor name
      },
    }));
  };

  // Handle form submission for step 1
  const handleSubmitStep1 = async () => {
    if (!validated) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const basePayload = {
        title: formData.title,
        abstract: formData.abstract,
        authorIds: formData.authorIds,
        departmentId: formData.departmentId,
        schoolId: formData.schoolId,
        year: formData.year,
      };

      const payload: CreateProjectPayload = formData.supervisor?.id
        ? { ...basePayload, supervisorId: formData.supervisor.id }
        : {
            ...basePayload,
            newSupervisor: { name: formData.supervisor?.name || "" },
          };

      const response = await createProject(payload);

      if (!response?.data?.id) {
        throw new Error("Project creation failed - no ID returned");
      }

      setProjectId(response.data.id);
      setFileData((prev) => ({ ...prev, projectId: response.data.id }));

      // Explicitly go to step 2
      setCurrentStep(2);
    } catch (err) {
      setError("Failed to create project. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for step 2
  const handleSubmitStep2 = async () => {
    if (!projectId) {
      setError("Missing project association");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!fileData.path) {
      setError("Please upload the file first");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Prepare the payload with data from both selectedFile and fileData
      const payload: filePayloadType = {
        filename: selectedFile.name,
        path: fileData.path, // Use the Cloudinary URL from fileData
        mimetype: selectedFile.type,
        size: selectedFile.size,
        projectId: projectId,
      };

      // Call your fileUpload service function
      fileUpload(payload);

      // Update local state
      setFileData((prev) => ({
        ...prev,
        projectId: projectId,
      }));

      // Mark as complete
      setIsComplete(true);
      toast.success("Project submitted successfully!");
    } catch (err) {
      setError("Failed to submit file metadata");
      toast.error(
        `Submission error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error("Submission error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the entire form
  const handleReset = () => {
    setFormData({
      title: "",
      abstract: "",
      authorIds: [`${user?.id}`], // Keep the current user as default author
      supervisor: {}, // Reset supervisor object
      schoolId: `${user?.schoolId}`, // Keep the current school
      departmentId: "",
      year: "",
    });
    setFileData({
      filename: "",
      path: "",
      mimetype: "",
      size: 0,
      projectId: "",
    });
    setSelectedFile(null);
    setProjectId(null);
    setCurrentStep(1);
    setIsComplete(false);
    setError(null);
    setCollegeId("");
    setDepartmentId("");
    setSupervisorId(""); // Keep this if you're still using it for UI state
    setNewSupervisorName(""); // Reset the new supervisor name input
    setShowCreateNew(false); // Reset to showing existing supervisors
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle dialog close attempt
  const handleDialogClose = () => {
    if (!isComplete && (formData.title || selectedFile)) {
      if (
        window.confirm(
          "Are you sure you want to close? All your progress will be lost."
        )
      ) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  // Starting a new submission
  const handleNewSubmission = () => {
    handleReset();
    setIsOpen(true);
  };

  const renderDialogContent = () => {
    // Render success message when form is complete
    if (isComplete) {
      return (
        <div className="flex flex-col items-center space-y-4 py-4">
          <CheckCircle className="text-green-500" size={64} />
          <h2 className="text-2xl font-bold text-center">
            Project Submission Complete!
          </h2>
          <p className="text-gray-600 text-center">
            Your project has been successfully submitted to the digital
            repository.
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full">
            <h3 className="font-semibold">Project Details:</h3>
            <p className="text-sm text-gray-700 mt-2">
              Title: {formData.title}
            </p>
            <p className="text-sm text-gray-700">File: {fileData.filename}</p>
            <p className="text-sm text-gray-700">ID: {projectId}</p>
          </div>

          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <Button
              onClick={() => {
                handleReset();
                setCurrentStep(1);
              }}
            >
              Submit Another Project
            </Button>
          </DialogFooter>
        </div>
      );
    }

    return (
      <>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                } text-white font-bold`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Project Details</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div
                className={`h-full ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                } transition-all duration-300`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                } text-white font-bold transition-colors duration-300`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">File Upload</span>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertTriangle
              className="text-red-500 mr-2 flex-shrink-0"
              size={18}
            />
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Step 1: Project Details Form */}
        {currentStep === 1 && (
          <ScrollArea className="h-[calc(550px-53px-72px)] px-3">
            <div className="space-y-4 transition-all duration-300 ease-in-out">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the title of your project"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="abstract">Abstract (optional)</Label>
                  <Textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                  ></Textarea>
                </div>

                {/* College */}
                <div className="grid gap-2">
                  <Label htmlFor="college">
                    College <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Select
                      value={collegeId}
                      onValueChange={(value) => setCollegeId(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>College</SelectLabel>
                          {collegeStatus === "success" &&
                            colleges?.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Department - Only enabled when a college is selected */}
                <div className="grid gap-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Select
                      value={departmentId}
                      onValueChange={(value) => setDepartmentId(value)}
                      disabled={!collegeId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !collegeId
                              ? "Select a college first"
                              : departments.length > 0
                              ? "Select department"
                              : "Loading..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Department</SelectLabel>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                          {departments.length === 0 && collegeId && (
                            <SelectItem value="none" disabled>
                              No departments available
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Supervisor - Only enabled when a department is selected */}
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="supervisor">
                      Supervisor <span className="text-red-500">*</span>
                    </Label>
                    {departmentId &&
                      supervisors.length === 0 &&
                      !showCreateNew && (
                        <span className="text-sm text-blue-600">
                          No supervisors found for this department
                        </span>
                      )}
                    {departmentId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleCreateMode}
                        className="text-xs h-7"
                      >
                        {showCreateNew ? "Select Existing" : "Create New"}
                      </Button>
                    )}
                  </div>

                  {!showCreateNew ? (
                    <div className="flex items-center">
                      <Select
                        value={formData.supervisor?.id || ""}
                        onValueChange={handleSelectSupervisor}
                        disabled={!departmentId || supervisors.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !departmentId
                                ? "Select a department first"
                                : supervisors.length > 0
                                ? "Select supervisor"
                                : "No supervisors available"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Supervisor</SelectLabel>
                            {supervisors.map((supervisor) => (
                              <SelectItem
                                key={supervisor.id}
                                value={supervisor.id}
                              >
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {formData.supervisor?.name ? (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 w-full">
                          <span className="flex-1">
                            {formData.supervisor.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                supervisor: {},
                              }));
                            }}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Input
                            id="newSupervisor"
                            placeholder="Enter supervisor name"
                            value={newSupervisorName}
                            onChange={(e) =>
                              setNewSupervisorName(e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (!newSupervisorName.trim()) return;
                              setFormData((prev) => ({
                                ...prev,
                                supervisor: {
                                  name: newSupervisorName.trim(),
                                },
                              }));
                            }}
                            disabled={!newSupervisorName.trim()}
                            size="sm"
                          >
                            Add
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    onClick={handleDialogClose}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  onClick={handleSubmitStep1}
                  disabled={!validated || isLoading}
                  className="flex items-center gap-2"
                >
                  {createProjectStatus === "pending" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span className="cursor-pointer">
                        {messages[messageIndex]}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="cursor-pointer">Next</span>
                      <ArrowRight size={16} className="cursor-pointer" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        )}

        {/* Step 2: File Upload Form */}
        {currentStep === 2 && (
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
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                        <File className="h-8 w-8 text-blue-500" />
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
                          <span>Upload file</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-green-50 text-green-800 rounded-md p-3 text-sm">
                      File successfully uploaded
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-2 text-sm text-red-600">{error}</div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>

              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    onClick={handleDialogClose}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                <Button
                  onClick={handleSubmitStep2}
                  disabled={!isUploaded || isLoading}
                  className="flex items-center gap-2"
                >
                  {fileStatus === "pending" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Submit</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="px-6 cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            Create Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md md:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isComplete
                ? "Project Submission Complete"
                : currentStep === 1
                ? "Submit Project Details"
                : "Upload Project File"}
            </DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>

      {/* Show a message when submission is complete and dialog is closed */}
      {isComplete && !isOpen && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md text-green-800">
          Your project has been successfully submitted!
          <Button
            onClick={handleNewSubmission}
            variant="link"
            className="ml-2 text-green-700"
          >
            Submit another
          </Button>
        </div>
      )}
    </div>
  );
};

export default MultiStepFormDialog;
