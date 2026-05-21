import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { signupPathForPlan } from "@/lib/subscriptionPlan";
import { cn } from "@/lib/utils";

function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-600">
      {included ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D5B]" aria-hidden />
      ) : (
        <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
      )}
      <span className={cn(!included && "text-gray-400")}>{text}</span>
    </li>
  );
}

function CompareCell({ value }: { value: boolean | "text" }) {
  if (value === "text") return null;
  return value ? (
    <Check className="mx-auto h-5 w-5 text-[#2E7D5B]" aria-label="Yes" />
  ) : (
    <X className="mx-auto h-5 w-5 text-gray-300" aria-label="No" />
  );
}

export function PricingSection() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="scroll-mt-24 bg-[#f6fbf8] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{t.pricingTitle}</h2>
          <p className="mt-3 text-base text-gray-600 md:text-lg">{t.pricingSubtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* FREE */}
          <article className="relative flex flex-col rounded-3xl border border-[#d7ebdc] bg-white p-8 shadow-sm ring-1 ring-[#d7ebdc]/60">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                🟢
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.pricingFreeName}</h3>
                <p className="text-sm text-gray-500">{t.pricingFreeTagline}</p>
              </div>
            </div>
            <p className="mt-6">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                {t.pricingFreePrice}
              </span>
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {t.pricingFreeFeatures.map((line) => (
                <FeatureRow
                  key={line}
                  text={line}
                  included={!t.pricingFreeExcluded.includes(line)}
                />
              ))}
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-8 h-12 w-full rounded-full border-[#2E7D5B] text-base font-semibold text-[#2E7D5B] hover:bg-[#e8f5ee]"
            >
              <Link to={signupPathForPlan("free")}>{t.pricingFreeCta}</Link>
            </Button>
          </article>

          {/* PRO */}
          <article className="relative flex flex-col rounded-3xl border-2 border-[#2E7D5B]/35 bg-white p-8 shadow-md shadow-[#2E7D5B]/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2E7D5B] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t.pricingRecommended}
            </span>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-lg" aria-hidden>
                🟡
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.pricingProName}</h3>
                <p className="text-sm text-gray-500">{t.pricingProTagline}</p>
              </div>
            </div>
            <p className="mt-6 flex flex-wrap items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                {t.pricingProPrice}
              </span>
              <span className="text-sm text-gray-500">{t.pricingProPriceNote}</span>
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {t.pricingProFeatures.map((line) => (
                <FeatureRow key={line} text={line} included />
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 h-12 w-full rounded-full bg-[#2E7D5B] text-base font-semibold text-white shadow-md shadow-[#2E7D5B]/20 hover:bg-[#256B4D]"
            >
              <Link to={signupPathForPlan("pro")}>{t.pricingProCta}</Link>
            </Button>
          </article>
        </div>

        {/* Comparison table */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-[#d7ebdc] bg-white shadow-sm">
          <h3 className="border-b border-gray-100 bg-white px-6 py-4 text-center text-lg font-bold text-gray-900 md:text-xl">
            {t.pricingCompareTitle}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f6fbf8]">
                  <th className="px-4 py-3 font-semibold text-gray-700 md:px-6">{t.pricingCompareFeature}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-6">FREE</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#2E7D5B] md:px-6">PRO</th>
                </tr>
              </thead>
              <tbody>
                {t.pricingCompareRows.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3.5 font-medium text-gray-800 md:px-6">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center md:px-6">
                      {row.free === "text" ? (
                        <span className="text-gray-700">{row.freeText}</span>
                      ) : (
                        <CompareCell value={row.free} />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center md:px-6">
                      {row.pro === "text" ? (
                        <span className="font-medium text-gray-800">{row.proText}</span>
                      ) : (
                        <CompareCell value={row.pro} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
