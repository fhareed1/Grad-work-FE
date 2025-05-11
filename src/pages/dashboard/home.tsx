import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/store/useAuth";

export const Home = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout breadcrumbs={[{ label: "Home", href: "/" }]}>
      <div className="flex items-center justify-center h-[calc(100vh-96px)]">
        <div className="text-center">
          <p className="mt-3 text-lg text-neutral-600">Coming soon...</p>
          <Link
            to={`/school/${user?.schoolId}/college`}
            replace
            className="block mt-5 text-purple-600 underline"
          >
            Go back to colleges
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};
