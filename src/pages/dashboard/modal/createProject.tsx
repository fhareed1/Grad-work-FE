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
} from "lucide-react";

// Import shadcn UI components
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
import { useQuery } from "@tanstack/react-query";
import { CollegeWithDepartments } from "@/types/college";
import collegeServices from "@/services/collegeServices";
import { useParams } from "react-router-dom";
import { DepartmentType, RawDepartment } from "@/types/department";
import departmentServices from "@/services/departmentServices";

interface FormData {
  title: string;
  abstract?: string;
  authorIds: string[];
  supervisorId: string;
  schoolId: string;
  departmentId: string;
  year: number;
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

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Selection states
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");

  // Form fields for step 1
  const [formData, setFormData] = useState<FormData>({
    title: "",
    abstract: "",
    authorIds: ["563b20d0-a09e-49da-b54e-658b20fae506"], // Default author ID
    supervisorId: "", // Will be populated when a supervisor is selected
    schoolId: "43e7290d-008c-4a21-a89a-41389df568cb", // Default school ID
    departmentId: "", // Will be populated when a department is selected
    year: new Date().getFullYear(),
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
  const [fileValidated, setFileValidated] = useState(false);

  // Selected file reference
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { schoolId } = useParams();

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
      setFormData(prev => ({
        ...prev,
        departmentId: departmentId
      }));
    }
  }, [departmentId, refetchSupervisors]);

  // Update formData when supervisorId changes
  useEffect(() => {
    if (supervisorId) {
      setFormData(prev => ({
        ...prev,
        supervisorId: supervisorId
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
      formData.abstract !== "" &&
      formData.authorIds.length > 0 &&
      formData.supervisorId !== "" &&
      formData.schoolId !== "" &&
      formData.departmentId !== "" &&
      formData.year > 0;

    setValidated(isValid);
  }, [formData]);

  // Validate step 2 form
  useEffect(() => {
    setFileValidated(selectedFile !== null);
  }, [selectedFile]);

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
    if (file) {
      setSelectedFile(file);
      setFileData({
        ...fileData,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        projectId: projectId || "", // Set from the response of step 1
      });
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileData({
      ...fileData,
      filename: "",
      path: "",
      mimetype: "",
      size: 0,
    });
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
      // Prepare form data without collegeId for submission
      const submissionData = {
        ...formData,
        // Do not include collegeId in the submission data
      };

      // Simulate API call to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mocked successful response with projectId
      const response = {
        success: true,
        projectId: "af64bdac-555f-4feb-9863-5ebb6060df4f",
      };

      setProjectId(response.projectId);
      setFileData((prev) => ({
        ...prev,
        projectId: response.projectId,
      }));

      // Move to step 2
      setCurrentStep(2);
    } catch (err) {
      setError("Failed to submit project details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for step 2
  const handleSubmitStep2 = async () => {
    if (!fileValidated) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to backend for file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mocked successful response with file path
      const response = {
        success: true,
        data: {
          ...fileData,
          path: "https://res.cloudinary.com/fhareed/image/upload/v1744655622/Digital%20repository%20for%20final%20year%20projects/Digital_repo_bsrttn.pdf",
        },
      };

      // Update fileData with the path from response
      setFileData(response.data);

      // Complete the form submission
      setIsComplete(true);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the entire form
  const handleReset = () => {
    setFormData({
      title: "",
      abstract: "",
      authorIds: ["563b20d0-a09e-49da-b54e-658b20fae506"],
      supervisorId: "",
      schoolId: "43e7290d-008c-4a21-a89a-41389df568cb",
      departmentId: "",
      year: new Date().getFullYear(),
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
    setSupervisorId("");
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
                        <SelectValue placeholder={
                          !collegeId 
                            ? "Select a college first" 
                            : departments.length > 0 
                              ? "Select department" 
                              : "No departments available"
                        } />
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
                  <Label htmlFor="supervisor">
                    Supervisor <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Select
                      value={supervisorId}
                      onValueChange={(value) => setSupervisorId(value)}
                      disabled={!departmentId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          !departmentId 
                            ? "Select a department first" 
                            : supervisors.length > 0 
                              ? "Select supervisor" 
                              : "No supervisors available"
                        } />
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
                          {supervisors.length === 0 && departmentId && (
                            <SelectItem value="none" disabled>
                              No supervisors available
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
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
                  {isLoading ? (
                    <>
                      <span>Submitting...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
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
                    PDF, DOC, or DOCX up to 10MB
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
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
                  disabled={!fileValidated || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span>Uploading...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <>
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
          <Button size="lg" className="px-6 cursor-pointer">
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