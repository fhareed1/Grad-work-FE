import { DashboardLayout } from "@/components/layout/DashboardLayout";
import collegeServices from "@/services/collegeServices";
import departmentServices from "@/services/departmentServices";
import projectServices from "@/services/projectServices";
import { useAuth } from "@/store/useAuth";
import { DepartmentType } from "@/types/department";
import {
  Calendar,
  User,
  Download,
  Clock,
  Share2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface College {
  id: string;
  name: string;
}

interface Author {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Supervisor {
  id: string;
  name: string;
  departmentId: string;
}

interface ProjectFile {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

interface ProjectData {
  id: string;
  title: string;
  abstract: string | null;
  visibility: string;
  year: number;
  authors: Author[];
  supervisor: Supervisor;
  department: {
    id: string;
    name: string;
  };
  school: {
    id: string;
    name: string;
  };
  categories: string[];
  tags: string[];
  files: ProjectFile[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

const ProjectDetails = () => {
  const { schoolName } = useAuth();
  const { schoolId, collegeId, departmentId, projectId } = useParams<{
    schoolId: string;
    collegeId: string;
    departmentId: string;
    projectId: string;
  }>();

  const { data: rawColleges } = useQuery({
    queryKey: ["colleges", schoolId],
    queryFn: () => collegeServices.getAllColleges(schoolId as string),
    enabled: !!schoolId,
  });

  const college: College | undefined = rawColleges?.find(
    (c: College) => c.id === collegeId
  );
  const collegeName = college?.name ?? "...";

  const { data: rawDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: () =>
      departmentServices.getAllDepartments(
        schoolId as string,
        collegeId as string
      ),
    enabled: !!schoolId && !!collegeId,
  });

  const department: DepartmentType | undefined = rawDepartments?.find(
    (d: DepartmentType) => d.id === departmentId
  );
  const departmentName = department?.name ?? "...";

  const [activeTab, setActiveTab] = useState("overview");

  const { data: project, isLoading } = useQuery<ProjectData>({
    queryKey: ["project", projectId],
    queryFn: () =>
      projectServices.getProjectById(
        schoolId as string,
        collegeId as string,
        departmentId as string,
        projectId as string
      ),
    enabled: !!schoolId && !!collegeId && !!departmentId && !!projectId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading project data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Project not found</div>
        </div>
      </DashboardLayout>
    );
  }

  // Format author names
  const authorNames = project.authors
    .map((author) => `${author.firstName} ${author.lastName}`)
    .join(", ");

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };

  // Get main PDF file
  const mainPdfFile = project.files.find(
    (file) => file.mimetype === "application/pdf"
  );

  // Sample related projects (since they're not in the API data)
  const sampleRelatedProjects = [
    {
      id: "1",
      title: "Machine Learning for Student Performance Analysis",
      author: "Jane Smith",
    },
    {
      id: "2",
      title: "Cloud-Based Repository for Academic Publications",
      author: "Michael Jones",
    },
    {
      id: "3",
      title: "Web-Based Project Management for Academic Teams",
      author: "Amanda Chen",
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: schoolName || project.school.name,
          href: `/school/${schoolId}/college`,
        },
        {
          label: collegeName,
          href: `/school/${schoolId}/college/`,
        },
        {
          label: departmentName || project.department.name,
          href: `/school/${schoolId}/college/${collegeId}/department`,
        },
        {
          label: "Projects",
          href: `/school/${schoolId}/college/${collegeId}/department/${departmentId}/project`,
        },
        {
          label:
            project.title.length > 30
              ? project.title.substring(0, 30) + "..."
              : project.title,
          href: `/school/${schoolId}/college/${collegeId}/department/${departmentId}/project/${projectId}`,
        },
      ]}
    >
      <div>
        {/* Project Header with Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                <span>
                  Author: <span className="font-medium">{authorNames}</span>
                </span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                <span>
                  Supervisor:{" "}
                  <span className="font-medium">{project.supervisor.name}</span>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs"
                >
                  #{tag.replace(/\s+/g, "")}
                </span>
              ))}
              {project.tags.length === 0 && (
                <span className="text-gray-500 text-sm">No tags</span>
              )}
            </div>
          </div>
        </div>

        {/* Project Actions Bar */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex overflow-x-auto space-x-6 py-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`whitespace-nowrap pb-2 px-1 border-b-2 cursor-pointer ${
                    activeTab === "overview"
                      ? "border-indigo-600 text-indigo-600 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("fulltext")}
                  className={`whitespace-nowrap pb-2 px-1 border-b-2 cursor-pointer ${
                    activeTab === "fulltext"
                      ? "border-indigo-600 text-indigo-600 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Full Text
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`whitespace-nowrap pb-2 px-1 border-b-2 cursor-pointer ${
                    activeTab === "resources"
                      ? "border-indigo-600 text-indigo-600 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab("related")}
                  className={`whitespace-nowrap pb-2 px-1 border-b-2 cursor-pointer ${
                    activeTab === "related"
                      ? "border-indigo-600 text-indigo-600 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Related Projects
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button className="text-gray-600 hover:text-indigo-700">
                  <Share2 size={18} />
                </button>

                {mainPdfFile && (
                  <a
                    href={mainPdfFile.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg flex items-center"
                  >
                    <Download size={16} className="mr-1" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="md:flex md:gap-8">
            {/* Main Project Content */}
            <div className="md:w-2/3">
              {activeTab === "overview" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <img
                    src="/api/placeholder/800/400"
                    alt={project.title}
                    className="w-full h-auto rounded-lg mb-6"
                  />

                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Abstract
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {project.abstract ||
                      "No abstract available for this project."}
                  </p>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords && project.keywords.length > 0 ? (
                        project.keywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            Digital Repository
                          </div>
                          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            Final Year Projects
                          </div>
                          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            Knowledge Management
                          </div>
                          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            Academic Research
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "fulltext" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {mainPdfFile ? (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center mb-4">
                      <FileText
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Full Document Preview
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The complete project report is available for download (
                        {(mainPdfFile.size / 1024).toFixed(1)} KB)
                      </p>
                      <a
                        href={mainPdfFile.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center mx-auto"
                      >
                        <Download size={16} className="mr-2" />
                        <span>Download Full Text</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center mb-4">
                      <FileText
                        size={48}
                        className="mx-auto text-yellow-500 mb-3"
                      />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Full Text Not Available
                      </h3>
                      <p className="text-gray-600">
                        The full text document for this project is not currently
                        available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Project Resources
                  </h2>

                  <div className="space-y-3">
                    {project.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                            <FileText className="text-indigo-700" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {file.filename}
                            </div>
                            <div className="text-sm text-gray-500">
                              {file.mimetype} • {(file.size / 1024).toFixed(1)}{" "}
                              KB
                            </div>
                          </div>
                        </div>
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))}

                    {project.files.length === 0 && (
                      <div className="text-center p-8 text-gray-500">
                        No resource files available for this project.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      External Resources
                    </h3>

                    <div className="space-y-3">
                      <a
                        href="#"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 text-gray-700"
                      >
                        <ExternalLink
                          size={16}
                          className="mr-2 text-gray-500"
                        />
                        <span>Project GitHub Repository</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 text-gray-700"
                      >
                        <ExternalLink
                          size={16}
                          className="mr-2 text-gray-500"
                        />
                        <span>Project Demo</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "related" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Related Projects
                  </h2>

                  <div className="space-y-4">
                    {sampleRelatedProjects.map((relatedProject) => (
                      <div
                        key={relatedProject.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <h3 className="font-medium text-gray-800 mb-1">
                          {relatedProject.title}
                        </h3>
                        <p className="text-gray-600">
                          By {relatedProject.author}
                        </p>
                        <a
                          href={`/projects/${relatedProject.id}`}
                          className="text-indigo-600 text-sm font-medium mt-2 inline-block hover:text-indigo-800"
                        >
                          View Project →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:w-1/3 mt-6 md:mt-0">
              <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Project Information
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-800">
                      {project.department.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">School:</span>
                    <span className="font-medium text-gray-800">
                      {project.school.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium text-gray-800">
                      {project.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility:</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {project.visibility.toLowerCase()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3"></div>

                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      Updated {formatDate(project.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-5">
                <h3 className="text-lg font-medium text-indigo-800 mb-3">
                  Contact Author
                </h3>
                <p className="text-indigo-700 text-sm mb-4">
                  Have questions about this project? Reach out to the author for
                  more information.
                </p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg">
                  Message Author
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;
