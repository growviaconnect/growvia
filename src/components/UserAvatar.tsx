"use client";

type Props = {
  photo?: string | null;
  name: string;
  size?: number;
  rounded?: "full" | "lg";
  className?: string;
};

export default function UserAvatar({ photo, name, size = 32, rounded = "full", className = "" }: Props) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roundedCls = rounded === "full" ? "rounded-full" : "rounded-lg";
  const sizeStyle = { width: size, height: size, minWidth: size, minHeight: size };

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`object-cover flex-shrink-0 ${roundedCls} ${className}`}
        style={sizeStyle}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-white flex-shrink-0 ${roundedCls} ${className}`}
      style={{
        ...sizeStyle,
        background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
        fontSize: Math.round(size * 0.35),
      }}
    >
      {initials}
    </div>
  );
}
