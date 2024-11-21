import {
  IconLogout,
  IconDashboard,
  IconUser,
  IconNews,
  IconCurrencyDollar,
  IconMessage,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";
import { Role } from "@prisma/client";

export const navLinks: NavItem[] = [
  { label: "User", icon: IconUser, link: "/dashboard/user", role: [Role.admin] },
  // { label: "Session", icon: IconMessage, link: "/dashboard/session", role: [Role.consultant] },
  { label: "Job Vacancy", icon: IconNews, link: "/dashboard/job", role: [Role.company, Role.admin] },
  {
    label: "Payment",
    icon: IconCurrencyDollar,
    role: [Role.admin],
    links: [
      // {
      //   label: "Chat",
      //   link: "/dashboard/payment/chat",
      // },
      {
        label: "Mapping",
        link: "/dashboard/payment/mapping",
      },
    ],
  },
  { label: "Career Mapping", icon: IconNews, link: "/dashboard/mapping", role: [Role.admin] }
];
