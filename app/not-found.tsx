import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-prose py-12">
      <h1 className="font-display text-5xl font-bold">Nothing on this hook</h1>
      <p className="mt-3 text-lg text-ink-2">That page doesn&rsquo;t exist. It may have been moved, or the link has a typo.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary no-underline">
          Go to the dashboard
        </Link>
        <Link href="/guides" className="btn no-underline">
          Browse repair guides
        </Link>
      </div>
    </div>
  );
}
