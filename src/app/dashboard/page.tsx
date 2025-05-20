import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import MultiStepFormDialog from "@/pages/dashboard/modal/createProject";
// import { useAuth } from "@/store/useAuth";

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
}

export default function DashboardSidebar({
  breadcrumbs = [],
  children,
}: {
  breadcrumbs?: BreadcrumbItemProps[];
  children: React.ReactNode;
}) {
  // const { user } = useAuth();

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Dynamic Header with Breadcrumbs */}
          <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4 border-b">
            <div className="flex shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {breadcrumbs.length > 0 && (
                <div className="hidden md:block">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => {
                        const truncatedLabel =
                          item.label.length > 20
                            ? item.label.slice(0, 20) + "..."
                            : item.label;

                        return (
                          <BreadcrumbItem key={index}>
                            {item.href ? (
                              <BreadcrumbLink href={item.href}>
                                {truncatedLabel}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{truncatedLabel}</BreadcrumbPage>
                            )}
                            {index < breadcrumbs.length - 1 && (
                              <BreadcrumbSeparator />
                            )}
                          </BreadcrumbItem>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              )}
            </div>

            <MultiStepFormDialog />
          </header>

          {/* Main Content Section */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
