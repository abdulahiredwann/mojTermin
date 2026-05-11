import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function UserHospitalsPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ee]">
          <Building2 className="h-8 w-8 text-[#2E7D5B]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{t.userHospitalsPageTitle}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.userHospitalsPageIntro}</p>
          <Button asChild className="mt-5 rounded-full bg-[#2E7D5B] hover:bg-[#256B4D]">
            <Link to="/user/dashboard">{t.userHospitalsGoToSearch}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
