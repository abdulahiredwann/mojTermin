import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2E7D5B]/90 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 text-sm sm:flex-row sm:items-center">
        <p className="text-white/95">{t.footerCopyright}</p>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link to="/privacy" className="underline-offset-4 transition-colors hover:underline">
            {t.footerPrivacy}
          </Link>
          <Link to="/terms" className="underline-offset-4 transition-colors hover:underline">
            {t.footerTerms}
          </Link>
          <Link to="/about" className="underline-offset-4 transition-colors hover:underline">
            {t.footerAbout}
          </Link>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="rounded-md bg-white px-4 font-semibold text-[#2E7D5B] hover:bg-white/90"
          >
            <Link to="/contact">{t.footerContact}</Link>
          </Button>
        </nav>
      </div>
      <div className="border-t border-white/20">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center text-xs leading-relaxed text-white/80">
          {t.footerDisclaimer}
        </p>
      </div>
    </footer>
  );
}
