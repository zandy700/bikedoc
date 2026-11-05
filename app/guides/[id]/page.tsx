import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Icon } from "@/components/ui/Icon";
import { VerifyChecklist } from "@/components/guides/VerifyChecklist";
import { DIFFICULTY_LABELS, DIFFICULTY_LEVEL, formatMinutes } from "@/components/guides/difficulty";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ id: g.id }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const guide = getGuide(id);
  if (!guide) return { title: "Guide not found" };
  return { title: guide.title, description: guide.summary };
}

export default async function GuidePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const guide = getGuide(id);
  if (!guide) notFound();

  const level = DIFFICULTY_LEVEL[guide.difficulty];

  return (
    <article className="mx-auto max-w-3xl">
      <p>
        <Link href="/guides" className="inline-flex min-h-11 items-center font-semibold text-ink-2 hover:text-ink">
          All guides
        </Link>
      </p>
      <header className="mt-2">
        <CategoryBadge category={guide.category} />
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{guide.title}</h1>
        <p className="mt-3 max-w-prose text-lg text-ink-2">{guide.summary}</p>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <dt className="text-sm text-ink-2">Difficulty</dt>
            <dd className="flex items-center gap-2 font-semibold">
              <span aria-hidden="true" className="flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <Icon key={n} name="wrench" width={16} height={16} className={n <= level ? "text-ink" : "text-line-strong"} />
                ))}
              </span>
              {DIFFICULTY_LABELS[guide.difficulty]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-2">Typical time</dt>
            <dd className="font-semibold">{formatMinutes(guide.timeMinutes)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-2">Steps</dt>
            <dd className="font-semibold">{guide.steps.length}</dd>
          </div>
        </dl>
      </header>

      {guide.safetyNotes.length > 0 ? (
        <section aria-labelledby="safety-h" className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--tag)_55%,var(--line))] bg-warn-soft p-4 sm:p-5">
          <h2 id="safety-h" className="flex items-center gap-2 font-display text-2xl font-bold">
            <Icon name="alert" />
            Safety first
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {guide.safetyNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="tools-h" className="panel p-4 sm:p-5">
          <h2 id="tools-h" className="font-display text-2xl font-bold">
            Tools
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {guide.tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="parts-h" className="panel p-4 sm:p-5">
          <h2 id="parts-h" className="font-display text-2xl font-bold">
            Parts that may be needed
          </h2>
          {guide.parts.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {guide.parts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-ink-2">None, usually.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="steps-h" className="mt-10">
        <h2 id="steps-h" className="font-display text-3xl font-bold">
          Steps
        </h2>
        <ol className="mt-4 flex flex-col gap-6">
          {guide.steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full bg-ink font-display text-xl font-bold text-panel"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="pt-2 font-display text-xl font-bold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1 max-w-prose">{s.body}</p>
                {s.caution ? (
                  <p className="mt-3 flex max-w-prose gap-2 rounded-lg bg-warn-soft p-3 text-sm">
                    <Icon name="alert" className="mt-0.5 shrink-0" width={18} height={18} />
                    <span>
                      <strong>Caution:</strong> {s.caution}
                    </span>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="verify-h" className="panel mt-10 p-4 sm:p-5">
        <h2 id="verify-h" className="font-display text-3xl font-bold">
          Check your work
        </h2>
        <p className="mt-1 text-sm text-ink-2">Tick each check as you test the bike. Ticks are not saved.</p>
        <div className="mt-3">
          <VerifyChecklist items={guide.verify} />
        </div>
      </section>
    </article>
  );
}
