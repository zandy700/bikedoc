import Link from "next/link";
import type { Issue } from "@/lib/diagnosis/schema";
import { getGuide } from "@/lib/guides";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";

export function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const guide = issue.guideId ? getGuide(issue.guideId) : undefined;
  const headingId = `issue-${index}-title`;
  return (
    <article aria-labelledby={headingId} className="repair-tag p-4 pl-7 sm:p-5 sm:pl-8">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={issue.category} />
      </div>
      <h3 id={headingId} className="mt-2 font-display text-2xl font-bold">
        {issue.title}
      </h3>
      <div className="mt-2">
        <ConfidenceMeter value={issue.confidence} id={`issue-${index}-conf`} />
      </div>
      <div className="mt-3">
        <h4 className="text-sm font-semibold text-ink-2">What points to this</h4>
        <p className="mt-0.5 max-w-prose">{issue.evidence}</p>
      </div>
      {issue.guideId ? (
        <p className="mt-4">
          <Link
            href={`/guides/${issue.guideId}`}
            className="inline-flex min-h-11 items-center font-semibold text-accent underline"
          >
            Repair guide: {guide?.title ?? "open the guide"}
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm text-ink-2">No guide for this one yet. Ask a senior mechanic to take a look.</p>
      )}
    </article>
  );
}
