import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function UserSettingsPage() {
  const { t } = useLanguage();
  const { user } = useUserAuth();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-10 md:px-12 md:py-14">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{t.authSettings}</h1>
        <p className="mt-3 text-sm text-gray-600 md:text-base">{t.userSettingsIntro}</p>
        {user ? (
          <dl className="mt-10 space-y-4 rounded-2xl border border-gray-100 bg-[#fafafa] p-6">
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
      </main>
    </div>
  );
}
