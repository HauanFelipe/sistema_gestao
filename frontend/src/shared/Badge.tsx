type BadgeTone = "blue" | "green" | "yellow" | "red" | "gray" | "purple";

const toneClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  green: "bg-green-500/15 text-green-400 border-green-500/20",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  gray: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

type Props = {
  label: string;
  tone?: BadgeTone;
  className?: string;
};

export default function Badge({ label, tone = "gray", className }: Props) {
  return (
    <span
      className={[
        "text-xs px-2 py-1 rounded-lg border",
        toneClasses[tone],
        className ?? "",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export type { BadgeTone };
