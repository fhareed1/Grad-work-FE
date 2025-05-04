import { DashboardLayout } from "@/components/layout/DashboardLayout";
import collegeServices from "@/services/collegeServices";
import departmentServices from "@/services/departmentServices";
import { useAuth } from "@/store/useAuth";
import { DepartmentType, RawDepartment } from "@/types/department";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Tag } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";


interface College {
  id: string;
  name: string;
}

const Department = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { schoolName } = useAuth();
  const { schoolId, collegeId } = useParams();

  const { data: rawColleges } = useQuery({
    queryKey: ["colleges", schoolId],
    queryFn: () => collegeServices.getAllColleges(schoolId as string),
    enabled: !!schoolId,
  });

  const college: College | undefined = rawColleges?.find(
    (c: College) => c.id === collegeId
  );
  const collegeName = college?.name ?? "...";

  const { data: departments = [], status: departmentStatus } = useQuery<
  DepartmentType[]
  >({
    queryKey: ["departments"],
    queryFn: async (): Promise<DepartmentType[]> => {
      const rawData: RawDepartment[] =
        await departmentServices.getAllDepartments(
          schoolId as string,
          collegeId as string
        );

      return rawData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        projects: dept._count?.projects || 0,
        image: undefined, // or derive from elsewhere
      }));
    },
  });

  const tags: string[] = [
    "Machine Learning",
    "Data Science",
    "IoT",
    "Robotics",
    "Sustainability",
    "Software Engineering",
    "Artificial Intelligence",
    "Virtual Reality",
    "Networks",
    "Cybersecurity",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          label: "Departments",
          href: `/school/${schoolId}/college/${collegeId}/department`,
        },
      ]}
    >
      <div className="flex flex-col w-full mt-5">
        {/* Search and Header */}
        <div className="flex flex-col w-full">
          {/* Search  */}
          <div className="hidden md:block flex-grow max-w-auto mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for departments..."
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

          {/* Header  */}
          {/* College Header with Back Navigation */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {collegeName}
              </h1>
              <p className="mt-2 text-gray-600">
                Select a department to browse final year projects
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Tags Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Tag size={18} className="text-gray-400 mr-3" />
            <div className="text-gray-700 mr-4 font-medium">Popular Tags:</div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  #{tag.replace(/\s+/g, "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      {departmentStatus !== "pending" ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tag Filters (if any selected) */}
          {selectedTags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-gray-700">Filtered by:</span>
                {selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    #{tag.replace(/\s+/g, "")}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-2 text-indigo-700 hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Departments Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Link
                to={`/school/${schoolId}/college/${collegeId}/department/${department.id}/projects`}
                key={department.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300"
              >
                <div className="h-40 bg-gray-200 relative">
                  <img
                    src={department.image || "placeholder.jpg"}
                    alt={department.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h2 className="text-xl font-bold">{department.name}</h2>
                    <p className="text-sm opacity-90">
                      {department.projects} projects
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">
                    Explore final year projects from students in this
                    department.
                  </p>
                  <div className="mt-4 text-indigo-600 font-medium">
                    Browse Projects →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results Message */}
          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                No departments found matching your search
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      ) : (
        <Loader2 className="animate-spin" />
      )}
    </DashboardLayout>
  );
};

export default Department;
