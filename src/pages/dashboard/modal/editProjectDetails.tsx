import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CreateProjectPayload, ProjectData, Supervisor } from "@/types/project";
import { AlertTriangle, Loader2, Save, X } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CollegeWithDepartments } from "@/types/college";
import collegeServices from "@/services/collegeServices";
import { useParams } from "react-router-dom";
import { DepartmentType, RawDepartment } from "@/types/department";
import departmentServices from "@/services/departmentServices";
import projectServices from "@/services/projectServices";
import { toast } from "sonner";

type EditProjectProps = {
  onOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectData: ProjectData | null;
  setProjectData?: React.Dispatch<React.SetStateAction<ProjectData | null>>;
  onSave?: (updatedProject: ProjectData) => Promise<void>;
};

interface FormData {
  title: string;
  abstract?: string;
  authorIds: string[];
  supervisor?: {
    id?: string;
    name?: string;
  };
  schoolId: string;
  departmentId: string;
  year: string; // Keep as string for form input, convert to number when submitting
}

const EditProjectDetails = ({
  onOpen,
  onOpenChange,
  projectData,
}: EditProjectProps) => {
  const { user } = useAuth();
  const { schoolId, projectId } = useParams();
  const messages = [
    "Updating...",
    "Still working...",
    "Almost there...",
    "Hold tight...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    abstract: "",
    authorIds: [user?.id ?? ""],
    supervisor: {},
    schoolId: `${user?.schoolId}`,
    departmentId: "",
    year: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Selection states
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSupervisorName, setNewSupervisorName] = useState("");
  const [validated, setValidated] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize form data when projectData changes
  // Replace your current initialization useEffect with this:
  useEffect(() => {
    if (projectData && onOpen) {
      // Only initialize when the sheet is open
      setFormData({
        title: projectData.title || "",
        abstract: projectData.abstract || "",
        authorIds: [user?.id ?? ""],
        supervisor: projectData.supervisor || {},
        schoolId: projectData.schoolId || `${user?.schoolId}`,
        departmentId: projectData.departmentId || "",
        year:
          projectData.year?.toString() || new Date().getFullYear().toString(),
      });

      // Set department ID
      setDepartmentId(projectData.departmentId || "");

      // Set supervisor ID if exists
      if (projectData.supervisor?.id) {
        setSupervisorId(projectData.supervisor.id);
      }

      // Reset college selection to allow proper department loading
      setCollegeId("");
    }
  }, [projectData, onOpen, user?.id, user?.schoolId]);

  // Fetch colleges
  const { data: colleges, status: collegeStatus } = useQuery<
    CollegeWithDepartments[]
  >({
    queryKey: ["colleges"],
    queryFn: () => collegeServices.getAllColleges(schoolId as string),
    enabled: !!schoolId,
  });

  // Set college ID when colleges data is available and we have a department
  useEffect(() => {
    if (colleges && projectData?.departmentId && !collegeId) {
      console.log("College auto-selection skipped - department type mismatch");
    }
  }, [colleges, projectData?.departmentId, collegeId]);

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
    enabled: !!collegeId && !!schoolId,
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
    enabled: !!departmentId,
  });

  // Update the project
  const { mutateAsync: updateProject, status: updateProjectStatus } =
    useMutation({
      mutationFn: async (payload: CreateProjectPayload) => {
        const response = await projectServices.updateProject(
          payload,
          schoolId as string,
          projectId as string
        );
        return response;
      },
      onSuccess: () => {
        toast.success("Project updated successfully!");
        window.location.reload(); 
      },
      onError: (error) => {
        console.error("Update error:", error);
        toast.error("Failed to update project. Please try again.");
      },
    });

  useEffect(() => {
    if (updateProjectStatus === "pending") {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [updateProjectStatus, messages.length]);

  // Reset department and supervisor selections when college changes
  useEffect(() => {
    if (collegeId && projectData) {
      // Only reset if this is a new college selection (not initialization)
      const isInitialLoad = projectData.departmentId && !departmentId;
      if (!isInitialLoad && departmentId !== projectData.departmentId) {
        setDepartmentId("");
        setSupervisorId("");
        setFormData((prev) => ({
          ...prev,
          departmentId: "",
          supervisor: {},
        }));
      }
      refetchDepartments();
    } else if (collegeId && !projectData) {
      // New project - always reset
      setDepartmentId("");
      setSupervisorId("");
      setFormData((prev) => ({
        ...prev,
        departmentId: "",
        supervisor: {},
      }));
      refetchDepartments();
    }
  }, [collegeId, projectData?.departmentId]);

  // Reset supervisor selection when department changes
  useEffect(() => {
    if (departmentId && projectData) {
      // Only reset supervisor if this is a new department selection
      const isInitialLoad = departmentId === projectData.departmentId;
      if (!isInitialLoad) {
        setSupervisorId("");
        setFormData((prev) => ({
          ...prev,
          supervisor: {},
        }));
      }

      setFormData((prev) => ({
        ...prev,
        departmentId: departmentId,
      }));

      refetchSupervisors();
    } else if (departmentId && !projectData) {
      // New project - always reset supervisor
      setSupervisorId("");
      setFormData((prev) => ({
        ...prev,
        departmentId: departmentId,
        supervisor: {},
      }));
      refetchSupervisors();
    }
  }, [departmentId, projectData?.departmentId]); // Removed refetchSupervisors from dependencies

  // Update formData when supervisorId changes
  useEffect(() => {
    if (supervisorId) {
      setFormData((prev) => ({
        ...prev,
        supervisor: {
          id: supervisorId,
          name: undefined,
        },
      }));
    }
  }, [supervisorId]);

  // Validate form
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

  // Handle field changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? value : value, // Keep year as string for now
    }));
  };

  const toggleCreateMode = () => {
    setShowCreateNew(!showCreateNew);
    setSupervisorId("");
    setNewSupervisorName("");
    setFormData((prev) => ({
      ...prev,
      supervisor: {},
    }));
  };

  // When selecting an existing supervisor
  const handleSelectSupervisor = (id: string) => {
    setSupervisorId(id);
    setFormData((prev) => ({
      ...prev,
      supervisor: {
        id,
        name: undefined,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        year: formData.year, // Convert to integer
      };

      let payload: CreateProjectPayload;

      // Handle supervisor logic
      if (formData.supervisor?.id) {
        // Existing supervisor selected
        payload = {
          ...basePayload,
          supervisorId: formData.supervisor.id,
        };
      } else if (formData.supervisor?.name) {
        // New supervisor name provided
        payload = {
          ...basePayload,
          newSupervisor: { name: formData.supervisor.name },
        };
      } else {
        // No supervisor selected - this will disconnect any existing supervisor
        payload = basePayload;
      }

      await updateProject(payload);
    } catch (err) {
      setError("Failed to update project. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the entire form
  const handleReset = useCallback(() => {
    setFormData({
      title: "",
      abstract: "",
      authorIds: [`${user?.id}`],
      supervisor: {},
      schoolId: `${user?.schoolId}`,
      departmentId: "",
      year: "",
    });

    setIsComplete(false);
    setError(null);
    setCollegeId("");
    setDepartmentId("");
    setSupervisorId("");
    setNewSupervisorName("");
    setShowCreateNew(false);
  }, [user?.id, user?.schoolId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!onOpen) {
      if (!isComplete) {
        handleReset();
      }
    }
  }, [onOpen, isComplete, handleReset]);

  return (
    <Sheet open={onOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto overflow-x-hidden p-4">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Update your project details here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <form className="grid gap-8 py-4 overflow-auto" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertTriangle
                className="text-red-500 mr-2 flex-shrink-0"
                size={18}
              />
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="space-y-3">
            {/* Project Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Enter the title of your project"
                required
              />
            </div>

            {/* Abstract */}
            <div className="grid gap-2">
              <Label htmlFor="abstract">Abstract (optional)</Label>
              <Textarea
                id="abstract"
                name="abstract"
                value={formData.abstract || ""}
                onChange={handleChange}
                placeholder="Enter project abstract"
              />
            </div>

            {/* College */}
            <div className="grid gap-2">
              <Label htmlFor="college">
                College <span className="text-red-500">*</span>
              </Label>
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

            {/* Department */}
            <div className="grid gap-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
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
                      <SelectItem key={department.id} value={department.id}>
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

            {/* Supervisor */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="supervisor">
                  Supervisor <span className="text-red-500">*</span>
                </Label>
                {departmentId && supervisors.length === 0 && !showCreateNew && (
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
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  {formData.supervisor?.name ? (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 w-full">
                      <span className="flex-1">{formData.supervisor.name}</span>
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
                        onChange={(e) => setNewSupervisorName(e.target.value)}
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
                          setNewSupervisorName("");
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

            {/* Year */}
            <div>
              <Label htmlFor="year">
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2000"
                max="2100"
                placeholder="Enter project year"
                required
              />
            </div>
          </div>

          <SheetFooter className="mt-10">
            <Button type="submit" disabled={!validated || isLoading}>
              {updateProjectStatus === "pending" ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  <span>{messages[messageIndex]}</span>
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProjectDetails;
