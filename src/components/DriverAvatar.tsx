import type { Driver } from "@/lib/types";

interface Props {
  driver: Driver;
  size?: number;
}

export default function DriverAvatar({ driver, size = 36 }: Props) {
  const initials = driver.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (driver.avatar_type === "photo" && driver.avatar_value) {
    return (
      <img
        src={driver.avatar_value}
        alt={driver.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  if (driver.avatar_type === "emoji" && driver.avatar_value) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: driver.color_hex + "18",
        }}
      >
        <span style={{ fontSize: size * 0.5 }}>{driver.avatar_value}</span>
      </div>
    );
  }

  // Initials fallback
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: driver.color_hex + "18",
        color: driver.color_hex,
      }}
    >
      <span className="font-medium" style={{ fontSize: size * 0.35 }}>
        {initials}
      </span>
    </div>
  );
}
