import DashboardSidebar, { BreadcrumbItemProps } from "@/app/dashboard/page";

export const DashboardLayout = ({
  children,
  breadcrumbs = [],
}: {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItemProps[];
}) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar + Header + Main Content */}
      <DashboardSidebar breadcrumbs={breadcrumbs}>{children}</DashboardSidebar>
    </div>
  );
};
