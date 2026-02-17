import { Badge } from "@/components/ui/badge";

const TYPE_STYLES: Record<string, string> = {
  note: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  conversation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  task: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  bookmark: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  snippet: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" className={TYPE_STYLES[type] ?? ""}>
      {type}
    </Badge>
  );
}
