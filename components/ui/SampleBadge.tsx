export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`tag-chip tag-chip-hivis whitespace-nowrap ${className}`}
      title="Bikes, shipments and stats in this app are sample data"
    >
      Sample data
    </span>
  );
}
