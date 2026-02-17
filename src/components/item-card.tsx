import Link from "next/link";
import { TypeBadge } from "./type-badge";

interface ItemCardProps {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  updated_at: string;
}

export function ItemCard({ id, type, title, content, tags, updated_at }: ItemCardProps) {
  const preview = content.length > 150 ? content.slice(0, 150) + "..." : content;
  const date = new Date(updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/items/${id}`}
      className="block rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm leading-tight">{title}</h3>
        <TypeBadge type={type} />
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{preview}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{date}</span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-muted px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
