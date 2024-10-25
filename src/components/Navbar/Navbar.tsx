"use client";

import { ScrollArea } from "@mantine/core";

import { UserButton } from "@/components/UserButton/UserButton";
import type { NavItem } from "@/types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import { IconLogout } from "@tabler/icons-react";
import { useGlobal } from "@/context/global";

interface Props {
  data: NavItem[];
  hidden?: boolean;
}

export function Navbar({ data }: Props) {
  const auth = useGlobal()

  const links = data.map((item) => (
    <NavLinksGroup key={item.label} {...item} />
  ));

  return (
    <>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {links}
          <div onClick={() => auth?.logout()}>
            <NavLinksGroup icon={IconLogout} label="Logout" />
          </div>
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton
          image={`https://api.multiavatar.com/${auth?.user?.name}.svg`}
          name={auth?.user?.name ?? ''}
          email={auth?.user?.email ?? ''}
        />
      </div>
    </>
  );
}
