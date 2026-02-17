import { ItemCard } from "./item-card";
import type { Item } from "@/../db/schema";

export function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No items found</p>
        <p className="text-sm mt-1">Create items via the API or drop markdown files in the data directory</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          type={item.type}
          title={item.title}
          content={item.content}
          tags={item.tags as string[]}
          updated_at={item.updated_at}
        />
      ))}
    </div>
  );
}
