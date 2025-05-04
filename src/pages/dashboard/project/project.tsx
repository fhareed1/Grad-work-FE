import { DashboardLayout } from "@/components/layout/DashboardLayout";
import collegeServices from "@/services/collegeServices";
import departmentServices from "@/services/departmentServices";
import projectServices from "@/services/projectServices";
import { useAuth } from "@/store/useAuth";
import { DepartmentType } from "@/types/department";
import { Author, ProjectData } from "@/types/project";
import { Tag } from "@/types/tag";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Download,
  Eye,
  Filter,
  Loader2,
  Search,
  ThumbsUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

interface College {
  id: string;
  name: string;
}

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const { schoolName } = useAuth();
  const { schoolId, collegeId, departmentId } = useParams<{
    schoolId: string;
    collegeId: string;
    departmentId: string;
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

  const { data: projects = [], isLoading } = useQuery<ProjectData[]>({
    queryKey: ["projects"],
    queryFn: () =>
      projectServices.getAllProjects(
        schoolId as string,
        collegeId as string,
        departmentId as string
      ),
    enabled: !!schoolId && !!collegeId && !!departmentId,
  });

  // Filter and sort projects
  let filteredProjects = [...(projects || [])];

  // Filter by search query
  if (searchQuery) {
    filteredProjects = filteredProjects.filter((project: ProjectData) => {
      const projectTags = project.tags.map((tag: Tag) => tag.name);
      const authorName = project.authors
        .map((author: Author) => `${author.firstName} ${author.lastName}`)
        .join(" ");

      return (
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        projectTags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        project.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        project.supervisor.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    });
  }

  // Filter by year
  if (yearFilter !== "all") {
    filteredProjects = filteredProjects.filter(
      (project: ProjectData) => project.year.toString() === yearFilter
    );
  }

  // Sort projects
  switch (sortBy) {
    case "newest":
      filteredProjects.sort(
        (a: ProjectData, b: ProjectData) => b.year - a.year
      );
      break;
    case "oldest":
      filteredProjects.sort(
        (a: ProjectData, b: ProjectData) => a.year - b.year
      );
      break;
    case "popular":
      filteredProjects.sort(
        (a: ProjectData, b: ProjectData) => (b.views || 0) - (a.views || 0)
      );
      break;
    case "downloads":
      filteredProjects.sort(
        (a: ProjectData, b: ProjectData) =>
          (b.downloads || 0) - (a.downloads || 0)
      );
      break;
    default:
      break;
  }

  // Get available years for filtering
  const years: number[] = [
    ...new Set(projects.map((project: ProjectData) => project.year)),
  ].sort((a: number, b: number) => b - a);

  // Generate placeholder thumbnail if none exists
  const getProjectThumbnail = (project: ProjectData): string => {
    return project.thumbnail || "/api/placeholder/400/300";
  };

  // Format author names
  const getAuthorNames = (authors: Author[]): string => {
    return (
      authors
        .map((author: Author) => `${author.firstName} ${author.lastName}`)
        .join(", ") || "Unknown"
    );
  };

  // Get tags for a project
  const getProjectTags = (project: ProjectData): string[] => {
    return project.tags.map((tag: Tag) => tag.name);
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: schoolName || "",
          href: `/school/${schoolId}/college`,
        },
        {
          label: collegeName,
          href: `/school/${schoolId}/college/`,
        },
        {
          label: departmentName,
          href: `/school/${schoolId}/college/${collegeId}/department`,
        },
        {
          label: "Projects",
          href: `/school/${schoolId}/college/${collegeId}/department/${departmentId}/project`,
        },
      ]}
    >
      <div className="flex flex-col w-full mt-5">
        {/* Search and welcome */}
        {/* Search */}
        <div className="flex flex-col w-full">
          {/* Search Bar */}
          <div className="hidden md:block flex-grow max-w-auto mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
          {/* Text */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {departmentName}
              </h1>
              <p className="mt-2 text-gray-600">
                Browse final year projects from students in this department
              </p>
            </div>
          </div>
        </div>
        {/* Filters and Sort Bar */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg mr-3"
                >
                  <Filter size={16} className="mr-1" />
                  <span>Filter</span>
                </button>

                <div className="text-sm text-gray-500">
                  {filteredProjects.length} projects found
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 mr-2 text-sm">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Viewed</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </div>

            {/* Filter Panel (shown when filter button clicked) */}
            {filterOpen && (
              <div className="mt-4 pb-3 border-t border-gray-200 pt-3">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Years</option>
                      {years.map((year: number) => (
                        <option key={year.toString()} value={year.toString()}>
                          {year.toString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional filters could be added here */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Projects List */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project: ProjectData) => (
                <Link
                  to={`/school/${schoolId}/college/${collegeId}/department/${departmentId}/project/${project.id}`}
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={getProjectThumbnail(project)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 mb-1">
                            {project.title}
                          </h2>
                          <p className="text-gray-600">
                            By {getAuthorNames(project.authors)}
                          </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar size={14} className="mr-1" />
                          <span>{project.year}</span>
                        </div>
                      </div>

                      {/* Supervisor Information */}
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <User size={14} className="mr-1" />
                        <span>
                          Supervisor:{" "}
                          {project.supervisor?.name || "Not assigned"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {getProjectTags(project).map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs"
                          >
                            #{tag.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>

                      <p className="mt-4 text-gray-600 line-clamp-2">
                        {project.abstract || "No abstract available"}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <a
                          href={`/project/${project.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View Project →
                        </a>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            <span>{project.views || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Download size={14} className="mr-1" />
                            <span>{project.downloads || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp size={14} className="mr-1" />
                            <span>{project.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setYearFilter("all");
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
