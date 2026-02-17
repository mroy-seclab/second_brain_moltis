import { Suspense } from "react";
import { listItems, type ItemType } from "@/lib/items";
import { ItemList } from "@/components/item-list";
import { FilterBar } from "@/components/filter-bar";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ type?: string; page?: string }>;
}

export default async function ItemsPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type as ItemType | undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  const result = listItems({ type, limit, offset });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Items</h2>
        <span className="text-sm text-muted-foreground">{result.total} total</span>
      </div>
      <Suspense>
        <FilterBar />
      </Suspense>
      <ItemList items={result.items} />
      {result.total > limit && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <a
              href={`/items?${new URLSearchParams({ ...(type ? { type } : {}), page: String(page - 1) }).toString()}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Previous
            </a>
          )}
          {offset + limit < result.total && (
            <a
              href={`/items?${new URLSearchParams({ ...(type ? { type } : {}), page: String(page + 1) }).toString()}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
