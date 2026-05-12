import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function UserSettingsPage() {
  const { t } = useLanguage();
  const { user } = useUserAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{t.authSettings}</h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">{t.settingsComingSoonIntro}</p>
        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
          {t.comingSoon}
        </p>
      </div>
      {user ? (
        <dl className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.authName}</dt>
            <dd className="mt-1 text-gray-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.authEmail}</dt>
            <dd className="mt-1 text-gray-900">{user.email}</dd>
          </div>
          {user.phone ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.authPhone}</dt>
              <dd className="mt-1 text-gray-900">{user.phone}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
