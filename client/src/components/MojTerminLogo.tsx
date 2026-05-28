import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/Images/mojtermin-logo.png";

type LogoSize = "sm" | "md" | "lg" | "xl";

type MojTerminLogoProps = {
  to?: string;
  className?: string;
  size?: LogoSize;
};

/**
 * Slot height = layout height (drives the navbar's height).
 * Scale = visual size only (does not affect layout flow).
 * Inline style is used for scale so it bypasses Tailwind JIT and HMR caching.
 */
const SLOT_HEIGHT_PX: Record<LogoSize, number> = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 40,
};

const SCALE: Record<LogoSize, number> = {
  sm: 1.5,
  md: 2,
  lg: 2.1,
  xl: 3.2,
};

export function MojTerminLogo({
  to,
  className,
  size = "md",
}: MojTerminLogoProps) {
  const inner = (
    <div
      className="flex w-full min-w-0 shrink-0 items-center"
      style={{ height: `${SLOT_HEIGHT_PX[size]}px` }}
    >
      <img
        src={LOGO_SRC}
        alt="MojTermin"
        className={cn(
          "h-full w-auto max-w-none object-contain object-left",
          className,
        )}
        style={{
          transform: `scale(${SCALE[size]})`,
          transformOrigin: "left center",
        }}
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
