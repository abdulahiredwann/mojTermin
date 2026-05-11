import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";

type AppointmentRow = {
  id: string;
  email: string;
  query: string;
  intent: string | null;
  city: string | null;
  hospitalId: string | null;
  hospitalName: string | null;
  preferredDate: string;
  status: string;
  createdAt: string;
};

type UserAppointmentsResponse = {
  stats: { total: number; byStatus: Record<string, number> };
  requests: AppointmentRow[];
};

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "confirmed" || s === "approved") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (s === "rejected" || s === "cancelled") return "bg-red-50 text-red-900 ring-red-200";
  return "bg-gray-50 text-gray-800 ring-gray-200";
}

export function UserAppointmentsPage() {
  const { t, locale } = useLanguage();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ["user-appointments"],
    queryFn: async () => {
      const res = await api.get<UserAppointmentsResponse>("/user/appointments");
      return res.data;
    },
    staleTime: 1000 * 30,
  });

  const stats = appointmentData?.stats ?? { total: 0, byStatus: {} as Record<string, number> };
  const requests = appointmentData?.requests ?? [];
  const pendingCount = stats.byStatus["pending"] ?? 0;

  function formatIsoDay(iso: string) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {t.dashboardHistoryTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">{t.dashboardIntro}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.dashboardCardTotal}</p>
          <p className="mt-1 text-3xl font-bold text-[#2E7D5B]">{isLoading ? "…" : stats.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.dashboardCardPending}</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{isLoading ? "…" : pendingCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-gray-500">…</p>
        ) : requests.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">{t.dashboardEmptyHistory}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableSubmitted}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableStatus}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableHospital}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableNeed}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableWhen}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatIsoDay(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${statusStyle(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td
                      className="max-w-[10rem] truncate px-4 py-3 text-gray-800"
                      title={r.hospitalName ?? ""}
                    >
                      {r.hospitalName ?? "—"}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600" title={r.query}>
                      {r.intent || r.query}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatIsoDay(r.preferredDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
