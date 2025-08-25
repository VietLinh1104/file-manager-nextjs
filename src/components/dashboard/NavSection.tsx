// src/components/dashboard/NavSection.tsx
import NavList from "./NavList";
import type { NavItem } from "@/types/dev-tool/nav";

type Props = {
  title: string;
  items: NavItem[];
  pathname: string;
};

export default function NavSection({ title, items, pathname }: Props) {
  return (
    <div>
      <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide opacity-60">{title}</div>
      <NavList items={items} pathname={pathname} />
    </div>
  );
}