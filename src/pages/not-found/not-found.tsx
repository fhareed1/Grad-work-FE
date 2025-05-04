import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const NotFound = () => {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Page Not Found", href: "/" }]}>
      <div className="flex items-center justify-center h-[calc(100vh-96px)]">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-neutral-900">404</h1>
          <p className="mt-3 text-lg text-neutral-600">
            The page you are looking for does not exist.
          </p>
          <Link to="/" className="block mt-5 text-purple-600 underline">
            Go back to home
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};
