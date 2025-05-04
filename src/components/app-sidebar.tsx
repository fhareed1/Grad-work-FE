import * as React from "react";
import {
  Bot,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/store/useAuth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, schoolName } = useAuth();

  const data = {
    user: {
      name: `${user?.firstName} ${user?.lastName}`,
      firstName: `${user?.firstName}`,
      lastName: `${user?.lastName}`,
      email: `${user?.email}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Grad Works",
        logo: GalleryVerticalEnd,
        school: schoolName || "",
      },
    ],
    navMain: [
      {
        title: "Home",
        url: "/",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/",
          },
        ],
      },
      {
        title: "Categories",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Project categories",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
