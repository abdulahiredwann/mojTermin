import { StoreBadges } from "@/components/StoreBadges";
import { SiteFooter } from "@/components/SiteFooter";

/** App store promo + site footer — use at the bottom of public marketing pages. */
export function SiteBottom() {
  return (
    <>
      <StoreBadges />
      <SiteFooter />
    </>
  );
}
