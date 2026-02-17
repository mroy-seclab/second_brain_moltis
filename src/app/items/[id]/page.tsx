import { notFound } from "next/navigation";
import { getItem } from "@/lib/items";
import { TypeBadge } from "@/components/type-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = getItem(id);

  if (!item) {
    notFound();
  }

  const tags = item.tags as string[];
  const metadata = item.metadata as Record<string, unknown>;
  const created = new Date(item.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const updated = new Date(item.updated_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/items"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to items
      </Link>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <TypeBadge type={item.type} />
          <h1 className="text-2xl font-semibold leading-tight">{item.title}</h1>
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Created: {created}</span>
          <span>Updated: {updated}</span>
          {item.source_path && <span>Source: {item.source_path}</span>}
        </div>

        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap border-t pt-6">
          {item.content}
        </div>

        {Object.keys(metadata).length > 0 && (
          <details className="border-t pt-4">
            <summary className="text-sm font-medium cursor-pointer text-muted-foreground">
              Metadata
            </summary>
            <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
