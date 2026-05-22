import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/Images/mojtermin-logo.png";

type MojTerminLogoProps = {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Fixed slot height so layout doesn't shift.
 * Image is scaled visually with CSS transform (doesn't affect flow).
 */
const slotClass = {
  sm: "h-8",
  md: "h-9",
  lg: "h-10",
};

const scaleClass = {
  sm: "scale-[1.5]",
  md: "scale-[2]",
  lg: "scale-[2.1]",
};

export function MojTerminLogo({ to, className, size = "md" }: MojTerminLogoProps) {
  const inner = (
    <div className={cn("flex w-full min-w-0 shrink-0 items-center", slotClass[size])}>
      <img
        src={LOGO_SRC}
        alt="MojTermin"
        className={cn(
          "h-full w-auto max-w-none object-contain object-left origin-left",
          scaleClass[size],
          className,
        )}
      />
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block w-full max-w-full shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/30"
      >
        {inner}
      </Link>
    );
  }

  return <div className="w-full max-w-full shrink-0">{inner}</div>;
}
