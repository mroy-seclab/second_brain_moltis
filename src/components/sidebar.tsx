"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "All", href: "/items", type: null },
  { label: "Notes", href: "/items?type=note", type: "note" },
  { label: "Conversations", href: "/items?type=conversation", type: "conversation" },
  { label: "Tasks", href: "/items?type=task", type: "task" },
  { label: "Bookmarks", href: "/items?type=bookmark", type: "bookmark" },
  { label: "Snippets", href: "/items?type=snippet", type: "snippet" },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card p-4 gap-1">
      <Link href="/items" className="text-lg font-semibold mb-6 px-2">
        Second Brain
      </Link>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === "/items" && currentType === item.type;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
