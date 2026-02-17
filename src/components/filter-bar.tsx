"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const TYPES = ["all", "note", "conversation", "task", "bookmark", "snippet"] as const;

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") ?? "all";

  function handleFilter(type: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`/items?${params.toString()}`);
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {TYPES.map((type) => (
        <Button
          key={type}
          variant={currentType === type ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(type)}
          className="text-xs capitalize"
        >
          {type}
        </Button>
      ))}
    </div>
  );
}
