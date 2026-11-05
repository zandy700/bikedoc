import { Icon } from "@/components/ui/Icon";

export const DEMO_BANNER_TEXT = "Demo mode — sample rule-based diagnosis, no AI key configured";

export function DemoBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--tag)_60%,var(--tag-ink))] bg-tag p-4 text-tag-ink"
    >
      <Icon name="alert" className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">{DEMO_BANNER_TEXT}</p>
        <p className="mt-1 text-sm">
          Results come from keyword rules in the description, not from the photo. Add an OpenAI or Anthropic API key
          on the server to enable AI diagnosis.
        </p>
      </div>
    </div>
  );
}
