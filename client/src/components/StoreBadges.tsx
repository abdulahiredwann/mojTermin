import { CrossPattern } from "@/components/CrossPattern";
import { useLanguage } from "@/contexts/LanguageContext";

export function StoreBadges() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#f6fbf8] py-8 md:py-10">
      <CrossPattern />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-base font-semibold text-gray-900 md:text-lg">{t.footerAppDownloadTitle}</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            aria-label={t.footerAppStoreAria}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white transition-transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 shrink-0"
              aria-hidden
            >
              <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3.02-.81.86-2.13 1.52-3.22 1.43-.13-1.13.43-2.31 1.17-3.07.83-.85 2.24-1.49 3.26-1.38zM20.5 17.21c-.55 1.27-.81 1.84-1.51 2.96-.99 1.57-2.39 3.52-4.13 3.54-1.55.01-1.94-1.01-4.04-.99-2.1.01-2.54 1.01-4.09 1-1.74-.02-3.06-1.78-4.05-3.35C.04 16.04-.27 11.04 1.93 8.27 3.4 6.39 5.7 5.27 7.86 5.27c2.2 0 3.58 1.21 5.4 1.21 1.77 0 2.85-1.21 5.39-1.21 1.92 0 3.96 1.05 5.41 2.86-4.76 2.6-3.99 9.4-3.56 9.08z" />
            </svg>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[0.55rem] uppercase opacity-80">{t.footerAppStoreCta}</span>
              <span className="text-xs font-semibold">{t.footerAppStoreLabel}</span>
            </span>
          </a>

          <a
            href="#"
            aria-label={t.footerPlayStoreAria}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white transition-transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="h-5 w-5 shrink-0"
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
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[0.55rem] uppercase opacity-80">{t.footerPlayStoreCta}</span>
              <span className="text-xs font-semibold">{t.footerPlayStoreLabel}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
