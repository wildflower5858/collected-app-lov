const parallelColors: Record<string, string> = {
  Base: "hsl(220 5% 52%)",
  Refractor: "hsl(200 60% 60%)",
  "Gold /50": "hsl(40 70% 55%)",
  "Gold Wave /50": "hsl(40 70% 55%)",
  "Pink RayWave": "hsl(340 60% 70%)",
  Sapphire: "hsl(270 40% 60%)",
};

export default function ParallelBadge({ parallel, size = "sm" }: { parallel: string; size?: "sm" | "lg" }) {
  const color = parallelColors[parallel] ?? "hsl(220 5% 52%)";
  const isLg = size === "lg";
  return (
    <span
      className={`shrink-0 rounded-full font-medium ${isLg ? "text-[12px] px-2.5 py-[3px]" : "text-[10px] px-2 py-0.5"}`}
      style={{
        backgroundColor: color + "18",
        color,
      }}
    >
      {parallel}
    </span>
  );
}
