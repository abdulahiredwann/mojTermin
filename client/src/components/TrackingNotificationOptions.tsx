import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type TrackingNotificationOptionsProps = {
  isPro: boolean;
  notifyEmail: boolean;
  onNotifyEmailChange: (checked: boolean) => void;
  notifyFasterRefresh: boolean;
  onNotifyFasterRefreshChange: (checked: boolean) => void;
  notifySms: boolean;
  onNotifySmsChange: (checked: boolean) => void;
};

function ProUpgradeLink() {
  const { t } = useLanguage();
  return (
    <Link
      to="/#pricing"
      className="shrink-0 text-[11px] font-semibold text-[#2E7D5B] hover:underline"
    >
      {t.trackingUpgradeToPro}
    </Link>
  );
}

function TrackingOptionRow({
  id,
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
  showUpgrade,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showUpgrade?: boolean;
}) {
  return (
    <div className={cn("flex gap-2.5 rounded-lg py-1", disabled && "opacity-70")}>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className="mt-0.5 shrink-0 border-[#2E7D5B] data-[state=checked]:border-[#2E7D5B] data-[state=checked]:bg-[#2E7D5B] disabled:cursor-not-allowed"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <label
            htmlFor={id}
            className={cn(
              "text-xs font-medium leading-snug text-gray-800",
              !disabled && "cursor-pointer",
              disabled && "cursor-default text-gray-500",
            )}
          >
            {label}
          </label>
          {showUpgrade ? <ProUpgradeLink /> : null}
        </div>
        {hint ? (
          <p className="text-[11px] leading-relaxed text-gray-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TrackingNotificationOptions({
  isPro,
  notifyEmail,
  onNotifyEmailChange,
  notifyFasterRefresh,
  onNotifyFasterRefreshChange,
  notifySms,
  onNotifySmsChange,
}: TrackingNotificationOptionsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 rounded-lg border border-gray-100 bg-[#f6fbf8] p-3 sm:min-w-0">
      <TrackingOptionRow
        id="tracking-notify-email"
        label={t.trackingEmailCheckbox}
        hint={t.trackingEmailHint}
        checked={notifyEmail}
        onCheckedChange={onNotifyEmailChange}
      />
      <TrackingOptionRow
        id="tracking-notify-faster"
        label={t.trackingFasterRefreshCheckbox}
        hint={t.trackingFasterRefreshHint}
        checked={isPro ? notifyFasterRefresh : false}
        disabled={!isPro}
        onCheckedChange={isPro ? onNotifyFasterRefreshChange : undefined}
        showUpgrade={!isPro}
      />
      <TrackingOptionRow
        id="tracking-notify-sms"
        label={t.trackingSmsCheckbox}
        hint={t.trackingSmsHint}
        checked={isPro ? notifySms : false}
        disabled={!isPro}
        onCheckedChange={isPro ? onNotifySmsChange : undefined}
        showUpgrade={!isPro}
      />
    </div>
  );
}
