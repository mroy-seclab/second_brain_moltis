"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TypeBadge } from "./type-badge";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  content: string;
  updated_at: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.items ?? []);
      }
    } catch {
      // ignore search errors
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(id: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/items/${id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search your brain..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {query.trim() ? "No results found." : "Start typing to search..."}
        </CommandEmpty>
        {results.map((item) => (
          <CommandItem
            key={item.id}
            value={item.id}
            onSelect={() => handleSelect(item.id)}
          >
            <div className="flex items-center gap-2 w-full">
              <TypeBadge type={item.type} />
              <span className="flex-1 truncate">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.updated_at).toLocaleDateString()}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
