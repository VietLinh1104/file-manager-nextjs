import Link from "next/link";
import type { NavItem } from "@/types/dev-tool/nav";

type Props = {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
};

export default function NavList({ items, pathname, onNavigate }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              "group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors " +
              (active ? "bg-muted font-medium" : "hover:bg-muted/70")
            }
          >
            <Icon className="h-4 w-4 opacity-80" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
