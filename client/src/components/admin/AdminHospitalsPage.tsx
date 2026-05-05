import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type HospitalService = {
  id: string;
  specialty: string | null;
  procedureName: string | null;
  estimatedWaitDays: number | null;
  earliestDate: string | null;
  isActive: boolean;
  notes: string | null;
};

type HospitalRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  emergency24h: boolean | null;
  bedCount: number | null;
  averageWaitDays: number | null;
  isActive: boolean;
  notes: string | null;
  serviceCount: number;
  services: HospitalService[];
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export function AdminHospitalsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-hospitals", page, limit, search],
    queryFn: async () => {
      const response = await api.get<{
        hospitals: HospitalRow[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/admin/hospitals", {
        params: { page, limit, q: search || undefined },
      });
      return response.data;
    },
  });

  const rows = useMemo(() => data?.hospitals ?? [], [data]);
  const pagination = data?.pagination;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
            <p className="text-sm text-gray-600">
              Emulator dataset for service coverage and estimated availability.
            </p>
          </div>
          <div className="min-w-[260px] flex-1 max-w-sm">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search hospital, city, specialty..."
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none ring-[#2E7D5B]/30 focus:ring-4"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-sm text-gray-500">Loading hospitals...</div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">Failed to load hospitals.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3">Avg wait</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((hospital) => (
                  <tr key={hospital.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{hospital.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Beds: {hospital.bedCount ?? "-"} | Emergency 24h:{" "}
                        {hospital.emergency24h === null
                          ? "-"
                          : hospital.emergency24h
                            ? "Yes"
                            : "No"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <p>{hospital.city ?? "-"}</p>
                      <p className="text-xs text-gray-500">{hospital.country ?? "-"}</p>
                      <p className="mt-1 text-xs text-gray-500">{hospital.address ?? "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <p>{hospital.phone ?? "-"}</p>
                      <p>{hospital.email ?? "-"}</p>
                      {hospital.website ? (
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#2E7D5B] hover:underline"
                        >
                          Open website
                        </a>
                      ) : (
                        <p className="text-xs text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        {hospital.services.length === 0 ? (
                          <p className="text-sm text-gray-500">No services</p>
                        ) : (
                          hospital.services.slice(0, 3).map((service) => (
                            <div key={service.id} className="rounded-md bg-gray-50 px-2 py-1.5">
                              <p className="text-xs font-semibold text-gray-800">
                                {service.specialty ?? "-"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {service.procedureName ?? "-"} | Wait:{" "}
                                {service.estimatedWaitDays ?? "-"} days | Earliest:{" "}
                                {formatDate(service.earliestDate)}
                              </p>
                            </div>
                          ))
                        )}
                        {hospital.services.length > 3 ? (
                          <p className="text-xs text-gray-500">
                            +{hospital.services.length - 3} more services
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {hospital.averageWaitDays ?? "-"} days
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          hospital.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {hospital.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-gray-500" colSpan={6}>
                      No hospitals found for this filter.
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
          {pagination?.total ?? rows.length} hospitals)
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
