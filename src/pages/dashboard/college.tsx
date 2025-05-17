import { DashboardLayout } from "@/components/layout/DashboardLayout";
import collegeServices from "@/services/collegeServices";
import { useAuth } from "@/store/useAuth";
import { CollegeWithDepartments } from "@/types/college";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const College = () => {
  const { schoolName } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { schoolId } = useParams();

  const { data: rawColleges, status: collegeStatus } = useQuery<
    CollegeWithDepartments[]
  >({
    queryKey: ["colleges"],
    queryFn: () => collegeServices.getAllColleges(schoolId as string),
  });

  const colleges = useMemo(() => {
    if (!rawColleges) return [];

    return rawColleges.map((college) => {
      const totalProjects = college.departments?.reduce(
        (sum, dept) => sum + (dept._count?.projects || 0),
        0
      );

      return {
        ...college,
        projects: totalProjects,
      };
    });
  }, [rawColleges]);

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { user } = useAuth();

  const getSchoolId = () => {
    if (user?.schoolId === "d1525575-6e25-44aa-8d4b-a36e0114a695") {
      return {
        image: "/bells-logo-big.webp",
        name: "Bells Logo",
      };
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          label: schoolName || "",
          href: `/school/${schoolId}/college`,
        },
      ]}
    >
      <div className="flex flex-col w-full mt-5">
        {/* Search and welcome */}
        {/* Search */}
        <div className="flex flex-col  w-full">
          <div className="hidden md:block flex-grow max-w-auto mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for colleges..."
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
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome to {schoolName}
              </h1>
              <p className="mt-2 text-gray-600">
                Select a college to browse departments and projects
              </p>
            </div>
          </div>
        </div>

        {/* College list   */}
        {collegeStatus !== "pending" ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Colleges Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college) => (
                <Link
                  to={`/school/${college.schoolId}/college/${college.id}/department`}
                  key={college.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300"
                >
                  <div className="h-40 bg-gray-200 relative">
                    <img
                      src={getSchoolId()?.image || "/default-logo.webp"}
                      alt={college.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h2 className="text-xl font-bold">{college.name}</h2>
                      <p className="text-sm opacity-90">
                        {college.projects} projects
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600">
                      Browse departments and explore final year projects from
                      students in this college.
                    </p>
                    <div className="mt-4 text-indigo-600 font-medium">
                      View College →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results Message */}
            {filteredColleges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  No colleges found matching your search
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
      </div>
    </DashboardLayout>
  );
};

export default College;
