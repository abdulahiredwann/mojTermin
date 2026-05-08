import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type AppointmentRequestRow = {
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

function fmtDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function fmtDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export function AdminAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-appointments", page, limit],
    queryFn: async () => {
      const res = await api.get<{
        requests: AppointmentRequestRow[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/appointments", { params: { page, limit } });
      return res.data;
    },
  });

  const rows = useMemo(() => data?.requests ?? [], [data]);
  const pagination = data?.pagination;

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-600">Incoming appointment requests from the website.</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-sm text-gray-500">Loading appointment requests…</div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">Failed to load appointment requests.</div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="min-w-[1100px] w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Preferred date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">User query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-4 text-sm text-gray-700">{fmtDateTime(r.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.intent ?? "-"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{r.hospitalName ?? "-"}</p>
                      <p className="text-xs text-gray-500">{r.city ?? "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{fmtDate(r.preferredDate)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.query}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-gray-500" colSpan={7}>
                      No appointment requests yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          Showing page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} (
          {pagination?.total ?? rows.length} requests)
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="limit">
            Rows:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
          >
            {[10, 20, 30, 50].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={!pagination || pagination.page <= 1}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination || pagination.page >= pagination.totalPages}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

