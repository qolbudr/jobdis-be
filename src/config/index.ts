import {
  IconLogout,
  IconDashboard,
  IconUser,
  IconNews,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";

export const navLinks: NavItem[] = [
  { label: "Dashboard", icon: IconDashboard, link: "/dashboard" },
  { label: "User", icon: IconUser, link: "/dashboard/user" },
  { label: "Job Vacancy", icon: IconNews, link: "/dashboard/job" },
  {
    label: "Payment",
    icon: IconCurrencyDollar,
    links: [
      {
        label: "Chat",
        link: "/dashboard/payment/chat",
      },
      {
        label: "Mapping",
        link: "/dashboard/form",
      },
    ],
  },
  { label: "Career Mapping", icon: IconNews, link: "/dashboard/mapping" }
];
