import { Role } from "@prisma/client";
import type { TablerIconsProps } from "@tabler/icons-react";

export interface NavItem {
  label: string;
  icon: (props: TablerIconsProps) => JSX.Element;
  link?: string;
  role: Role[];
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}
