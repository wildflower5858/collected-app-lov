import type { Person } from "@/lib/types";

interface Props {
  person: Person;
  size?: number;
}

export default function DriverAvatar({ person, size = 36 }: Props) {
  if (person.avatar_type === "image" && person.avatar_value) {
    return (
      <img
        src={person.avatar_value}
        alt={person.name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: person.color_hex + "22",
        border: `1.5px solid ${person.color_hex}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: person.color_hex,
        flexShrink: 0,
      }}
    >
      {person.name.charAt(0)}
    </div>
  );
}
