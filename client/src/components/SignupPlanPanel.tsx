import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SubscriptionPlan } from "@/lib/subscriptionPlan";
import { cn } from "@/lib/utils";

type SignupPlanPanelProps = {
  plan: SubscriptionPlan;
  onPlanChange: (plan: SubscriptionPlan) => void;
};

export function SignupPlanPanel({ plan, onPlanChange }: SignupPlanPanelProps) {
  const { t } = useLanguage();
  const isPro = plan === "pro";

  const highlights = isPro ? t.pricingProFeatures.slice(0, 4) : t.pricingFreeFeatures.slice(0, 4);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2E7D5B]">
          {t.signupPlanPanelEyebrow}
        </p>
        <h2 className="mt-0.5 text-lg font-bold text-gray-900">{t.signupPlanPanelTitle}</h2>
        <p className="mt-1 text-xs leading-snug text-gray-600">{t.signupPlanPanelSubtitle}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-plan" className="text-xs font-medium text-gray-700">
          {t.signupPlanChooseLabel}
        </label>
        <Select value={plan} onValueChange={(v) => onPlanChange(v as SubscriptionPlan)}>
          <SelectTrigger
            id="signup-plan"
            className="h-10 rounded-xl border-gray-200 bg-white text-sm shadow-none focus:ring-[#2E7D5B]/30"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-200">
            <SelectItem value="free" className="rounded-lg py-2.5">
              <span className="font-medium">{t.signupPlanFreeOption}</span>
            </SelectItem>
            <SelectItem value="pro" className="rounded-lg py-2.5">
              <span className="font-medium">{t.signupPlanProOption}</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <article
        className={cn(
          "mt-4 flex flex-col rounded-xl border p-4 transition-colors",
          isPro
            ? "border-[#2E7D5B]/30 bg-white shadow-sm"
            : "border-[#d7ebdc] bg-white/90",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <span aria-hidden>{isPro ? "🟡" : "🟢"}</span>
              {isPro ? t.pricingProName : t.pricingFreeName}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {isPro ? t.pricingProTagline : t.pricingFreeTagline}
            </p>
          </div>
          {isPro ? (
            <span className="shrink-0 rounded-full bg-[#2E7D5B] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {t.pricingRecommended}
            </span>
          ) : null}
        </div>

        <p className="mt-3">
          <span className="text-2xl font-extrabold text-gray-900">
            {isPro ? t.pricingProPrice : t.pricingFreePrice}
          </span>
          {isPro ? (
            <span className="ml-1 text-xs text-gray-500">{t.pricingProPriceNote}</span>
          ) : null}
        </p>

        <ul className="mt-3 space-y-1.5">
          {highlights.map((line) => (
            <li key={line} className="flex items-start gap-2 text-xs text-gray-600">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2E7D5B]" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11px] leading-snug text-gray-500">
          {isPro ? t.signupPlanProPaymentNote : t.signupPlanFreePaymentNote}
        </p>
      </article>
    </div>
  );
}
