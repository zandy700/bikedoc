import { CATEGORY_LABELS, type IssueCategory } from "@/lib/types";

export function CategoryBadge({ category }: { category: IssueCategory }) {
  return <span className="tag-chip">{CATEGORY_LABELS[category]}</span>;
}
