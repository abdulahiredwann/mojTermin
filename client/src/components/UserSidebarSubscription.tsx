import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function UserSidebarUpgradePromo({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const { user } = useUserAuth();
  if (!user || user.effectivePlan === "pro") return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#2E7D5B]/20 bg-gradient-to-br from-[#f6fbf8] to-[#e8f5ee] p-3 shadow-sm">
      <p className="text-sm font-bold leading-snug text-gray-900">{t.userSidebarUpgradeTitle}</p>
      <p className="mt-1 text-[11px] leading-snug text-gray-600">{t.userSidebarUpgradeBody}</p>
      <ul className="mt-2.5 space-y-1">
        {t.userSidebarUpgradeBullets.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2 pl-0.5 text-[11px] leading-snug text-gray-700"
          >
            <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-[#2E7D5B]" aria-hidden />
            {line}
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="sm"
        className="mt-3 h-9 w-full rounded-full bg-[#2E7D5B] text-xs font-semibold text-white hover:bg-[#256B4D]"
      >
        <Link to="/#pricing" onClick={onNavigate}>
          {t.userSidebarUpgradeCta}
        </Link>
      </Button>
    </div>
  );
}

/** FREE-only upgrade prompt above footer actions. */
export function UserSidebarSubscriptionBlock({ onNavigate }: { onNavigate?: () => void }) {
  return <UserSidebarUpgradePromo onNavigate={onNavigate} />;
}
