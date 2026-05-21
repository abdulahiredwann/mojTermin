import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function SettingsCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function UserSettingsPage() {
  const { t } = useLanguage();
  const { user, refreshMe } = useUserAuth();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.effectivePlan === "pro";

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  function apiError(err: unknown, fallback: string) {
    if (err instanceof AxiosError) {
      return (err.response?.data as { error?: string })?.error || fallback;
    }
    return fallback;
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProfileMsg(null);
    setProfileBusy(true);
    try {
      await api.patch("/user/profile", { name: name.trim() });
      await refreshMe();
      setProfileMsg(t.settingsProfileSaved);
    } catch (err) {
      setError(apiError(err, "Could not update profile."));
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setError(t.authPasswordMismatch);
      return;
    }
    setPasswordBusy(true);
    try {
      await api.patch("/user/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(t.settingsPasswordSaved);
    } catch (err) {
      setError(apiError(err, "Could not update password."));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function handleCancelSubscription() {
    setError(null);
    setCancelMsg(null);
    setCancelBusy(true);
    try {
      await api.post("/user/subscription/cancel");
      await refreshMe();
      setCancelMsg(t.settingsSubscriptionCancelled);
    } catch (err) {
      setError(apiError(err, "Could not cancel subscription."));
    } finally {
      setCancelBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{t.authSettings}</h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">{t.settingsIntro}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="inline-flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/80 p-1">
          <TabsTrigger
            value="profile"
            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2E7D5B] data-[state=active]:shadow-sm"
          >
            {t.settingsTabProfile}
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2E7D5B] data-[state=active]:shadow-sm"
          >
            {t.settingsTabPayments}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-5">
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
          {profileMsg ? (
            <p className="rounded-xl bg-[#e8f5ee] px-3 py-2 text-sm text-[#256B4D]">{profileMsg}</p>
          ) : null}
          {passwordMsg ? (
            <p className="rounded-xl bg-[#e8f5ee] px-3 py-2 text-sm text-[#256B4D]">{passwordMsg}</p>
          ) : null}
          {cancelMsg ? (
            <p className="rounded-xl bg-[#e8f5ee] px-3 py-2 text-sm text-[#256B4D]">{cancelMsg}</p>
          ) : null}

          <SettingsCard title={t.settingsProfileSection}>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">{t.authName}</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#2E7D5B]/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">{t.authEmail}</Label>
                <Input
                  id="settings-email"
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="h-10 cursor-not-allowed rounded-xl border-gray-200 bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500">{t.settingsEmailReadOnlyHint}</p>
              </div>
              <Button
                type="submit"
                disabled={profileBusy || !name.trim()}
                className="rounded-full bg-[#2E7D5B] hover:bg-[#256B4D]"
              >
                {profileBusy ? "…" : t.settingsSaveProfile}
              </Button>
            </form>
          </SettingsCard>

          <SettingsCard title={t.settingsPasswordSection}>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-current-pw">{t.settingsCurrentPassword}</Label>
                <Input
                  id="settings-current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#2E7D5B]/30"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-new-pw">{t.settingsNewPassword}</Label>
                  <Input
                    id="settings-new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#2E7D5B]/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-confirm-pw">{t.authConfirmPassword}</Label>
                  <Input
                    id="settings-confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#2E7D5B]/30"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={
                  passwordBusy || !currentPassword || !newPassword || newPassword.length < 8
                }
                variant="outline"
                className="rounded-full border-[#2E7D5B] text-[#2E7D5B] hover:bg-[#e8f5ee]"
              >
                {passwordBusy ? "…" : t.settingsSavePassword}
              </Button>
            </form>
          </SettingsCard>

          <SettingsCard title={t.settingsSubscriptionSection}>
            <p className="text-sm font-semibold text-gray-900">
              {isPro ? t.userSidebarPlanPro : t.userSidebarPlanFree}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {isPro ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={cancelBusy}
                      className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {t.settingsCancelPlan}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.settingsCancelPlanTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.settingsCancelPlanBody}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.dashboardCancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => void handleCancelSubscription()}
                      >
                        {t.settingsCancelPlanConfirm}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  asChild
                  className="rounded-full bg-[#2E7D5B] hover:bg-[#256B4D]"
                >
                  <Link to="/#pricing">{t.settingsUpgradePlan}</Link>
                </Button>
              )}
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <SettingsCard title={t.settingsPaymentsSection}>
            <p className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
              {t.comingSoon}
            </p>
            <p className="text-sm leading-relaxed text-gray-600">{t.settingsPaymentsComingSoon}</p>
          </SettingsCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
