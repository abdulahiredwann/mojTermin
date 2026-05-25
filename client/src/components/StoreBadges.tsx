import { CrossPattern } from "@/components/CrossPattern";
import { useLanguage } from "@/contexts/LanguageContext";

const BADGE_CLASS =
  "flex h-12 w-full items-center gap-2.5 rounded-lg bg-gray-900 px-3 text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]";

function AppleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3.02-.81.86-2.13 1.52-3.22 1.43-.13-1.13.43-2.31 1.17-3.07.83-.85 2.24-1.49 3.26-1.38zM20.5 17.21c-.55 1.27-.81 1.84-1.51 2.96-.99 1.57-2.39 3.52-4.13 3.54-1.55.01-1.94-1.01-4.04-.99-2.1.01-2.54 1.01-4.09 1-1.74-.02-3.06-1.78-4.05-3.35C.04 16.04-.27 11.04 1.93 8.27 3.4 6.39 5.7 5.27 7.86 5.27c2.2 0 3.58 1.21 5.4 1.21 1.77 0 2.85-1.21 5.39-1.21 1.92 0 3.96 1.05 5.41 2.86-4.76 2.6-3.99 9.4-3.56 9.08z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="h-6 w-6"
      aria-hidden
    >
      <path fill="#34A853" d="M325.3 234.3 104.6 13l280.8 161.2z" />
      <path fill="#FBBC04" d="M104.6 13l220.7 221.3-220.7 221.3z" />
      <path
        fill="#4285F4"
        d="M480.6 220.4 385.4 174.2l-60.1 60.1 60.1 60.1 95.5-46.2c25.1-13.6 25.1-34.2-.3-47.8z"
      />
      <path fill="#EA4335" d="m104.6 455.6 280.8-161.2-60.1-60.1z" />
    </svg>
  );
}

type StoreBadgeProps = {
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
  line1: string;
  line2: string;
};

function StoreBadge({ href, ariaLabel, icon, line1, line2 }: StoreBadgeProps) {
  return (
    <a href={href} aria-label={ariaLabel} className={BADGE_CLASS}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
      <span className="flex min-h-[2rem] min-w-0 flex-1 flex-col justify-center leading-none">
        <span className="truncate text-[0.55rem] font-medium uppercase tracking-wide text-white/80">
          {line1}
        </span>
        <span className="mt-0.5 truncate text-xs font-semibold">{line2}</span>
      </span>
    </a>
  );
}

export function StoreBadges() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#f6fbf8] py-8 md:py-10">
      <CrossPattern />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-base font-semibold text-gray-900 md:text-lg">{t.footerAppDownloadTitle}</h2>
        <div className="mx-auto mt-4 grid w-full max-w-[24rem] grid-cols-2 gap-3 sm:max-w-[23.5rem]">
          <StoreBadge
            href="#"
            ariaLabel={t.footerAppStoreAria}
            icon={<AppleIcon />}
            line1={t.footerAppStoreCta}
            line2={t.footerAppStoreLabel}
          />
          <StoreBadge
            href="#"
            ariaLabel={t.footerPlayStoreAria}
            icon={<GooglePlayIcon />}
            line1={t.footerPlayStoreCta}
            line2={t.footerPlayStoreLabel}
          />
        </div>
      </div>
    </section>
  );
}
