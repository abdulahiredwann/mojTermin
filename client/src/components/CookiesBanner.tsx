import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const COOKIES_CHOICE_KEY = "mojtermin.cookiesChoice";

type CookieChoice = "accepted" | "rejected";

export function CookiesBanner() {
  const { locale } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIES_CHOICE_KEY);
    if (saved === "accepted" || saved === "rejected") {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  function saveChoice(choice: CookieChoice) {
    localStorage.setItem(COOKIES_CHOICE_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  const isSl = locale === "sl";
  const bannerText = isSl
    ? "Uporabljamo minimalno količino piškotkov - vaša zasebnost je na prvem mestu."
    : "We use a minimal amount of cookies — your privacy comes first.";
  const acceptLabel = isSl ? "SPREJMI" : "ACCEPT";
  const rejectLabel = isSl ? "ZAVRNI" : "REJECT";
  const moreLabel = isSl ? "VEČ O PIŠKOTKIH" : "ABOUT COOKIES";

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-[#d9ece1] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-700">{bannerText}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="h-9 rounded-full bg-[#2E7D5B] px-4 text-xs font-semibold text-white hover:bg-[#256B4D]"
          >
            {acceptLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => saveChoice("rejected")}
            className="h-9 rounded-full border-gray-300 px-4 text-xs font-semibold text-gray-700"
          >
            {rejectLabel}
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-4 text-xs font-semibold text-[#2E7D5B] hover:bg-[#e8f5ee] hover:text-[#2E7D5B]"
          >
            <Link to="/cookies">{moreLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
