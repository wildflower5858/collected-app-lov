const parallelColors: Record<string, string> = {
  Base: "hsl(220 5% 52%)",
  Refractor: "hsl(200 60% 60%)",
  "Gold /50": "hsl(40 70% 55%)",
  "Gold Wave /50": "hsl(40 70% 55%)",
  "Pink RayWave": "hsl(340 60% 70%)",
  Sapphire: "hsl(270 40% 60%)",
};

export default function ParallelBadge({ parallel }: { parallel: string }) {
  const color = parallelColors[parallel] ?? "hsl(220 5% 52%)";
  return (
    <span
      className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: color + "18",
        color,
      }}
    >
      {parallel}
    </span>
  );
}
