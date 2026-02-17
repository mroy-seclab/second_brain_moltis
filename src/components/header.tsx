"use client";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <h1 className="text-sm font-medium md:hidden">Second Brain</h1>
      <div className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        className="text-xs text-muted-foreground gap-2"
        onClick={() => {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
      >
        <span>Search</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>
    </header>
  );
}
