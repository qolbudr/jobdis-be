import {
  IconLogout,
  IconDashboard,
  IconUser,
  IconNews,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";

export const navLinks: NavItem[] = [
  { label: "Dashboard", icon: IconDashboard, link: "/dashboard" },
  { label: "User", icon: IconUser, link: "/user" },
  { label: "Job Application", icon: IconNews, link: "/job" },
  { label: "Career Mapping", icon: IconNews, link: "/mapping" }
];
