import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminHospitalsChatPanel } from "@/components/admin/AdminHospitalsChatPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [tagPrompt, setTagPrompt] = useState("");
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [editingHospitalForm, setEditingHospitalForm] = useState<Partial<HospitalRow>>({});
  const [newHospitalName, setNewHospitalName] = useState("");
  const [newHospitalCity, setNewHospitalCity] = useState("");
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isChatbotPanelOpen, setIsChatbotPanelOpen] = useState(false);
  const [addingServiceForHospitalId, setAddingServiceForHospitalId] = useState<string | null>(null);
  const [newServiceForm, setNewServiceForm] = useState({
    specialty: "",
    procedureName: "",
    estimatedWaitDays: "",
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceForm, setEditingServiceForm] = useState({
    specialty: "",
    procedureName: "",
    estimatedWaitDays: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedHospitalIds.includes(row.id));

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });

  const createHospitalMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: newHospitalName,
        city: newHospitalCity || null,
        country: "Slovenia",
      };
      await api.post("/admin/hospitals", payload);
    },
    onSuccess: async () => {
      setNewHospitalName("");
      setNewHospitalCity("");
      await invalidateList();
    },
  });

  const updateHospitalMutation = useMutation({
    mutationFn: async () => {
      if (!editingHospitalId) return;
      await api.patch(`/admin/hospitals/${editingHospitalId}`, editingHospitalForm);
    },
    onSuccess: async () => {
      setEditingHospitalId(null);
      setEditingHospitalForm({});
      await invalidateList();
    },
  });

  const deleteHospitalMutation = useMutation({
    mutationFn: async (hospitalId: string) => {
      await api.delete(`/admin/hospitals/${hospitalId}`);
    },
    onSuccess: async () => {
      await invalidateList();
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      await api.post("/admin/hospitals/bulk-delete", { hospitalIds: selectedHospitalIds });
    },
    onSuccess: async () => {
      setSelectedHospitalIds([]);
      await invalidateList();
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: async () => {
      if (!addingServiceForHospitalId) return;
      await api.post(`/admin/hospitals/${addingServiceForHospitalId}/services`, {
        specialty: newServiceForm.specialty || null,
        procedureName: newServiceForm.procedureName || null,
        estimatedWaitDays: newServiceForm.estimatedWaitDays
          ? Number(newServiceForm.estimatedWaitDays)
          : null,
      });
    },
    onSuccess: async () => {
      setAddingServiceForHospitalId(null);
      setNewServiceForm({ specialty: "", procedureName: "", estimatedWaitDays: "" });
      await invalidateList();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({
      hospitalId,
      serviceId,
    }: {
      hospitalId: string;
      serviceId: string;
    }) => {
      await api.patch(`/admin/hospitals/${hospitalId}/services/${serviceId}`, {
        specialty: editingServiceForm.specialty || null,
        procedureName: editingServiceForm.procedureName || null,
        estimatedWaitDays: editingServiceForm.estimatedWaitDays
          ? Number(editingServiceForm.estimatedWaitDays)
          : null,
      });
    },
    onSuccess: async () => {
      setEditingServiceId(null);
      setEditingServiceForm({ specialty: "", procedureName: "", estimatedWaitDays: "" });
      await invalidateList();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async ({ hospitalId, serviceId }: { hospitalId: string; serviceId: string }) => {
      await api.delete(`/admin/hospitals/${hospitalId}/services/${serviceId}`);
    },
    onSuccess: async () => {
      await invalidateList();
    },
  });

  const toggleRowSelection = (hospitalId: string, checked: boolean) => {
    setSelectedHospitalIds((prev) =>
      checked ? [...new Set([...prev, hospitalId])] : prev.filter((id) => id !== hospitalId)
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      {!isChatbotPanelOpen ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
              <p className="text-sm text-gray-600">
                Emulator dataset for service coverage and estimated availability.
              </p>
            </div>
            <div className="flex min-w-[260px] flex-1 max-w-xl items-center gap-2">
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search hospital, city, specialty..."
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none ring-[#2E7D5B]/30 focus:ring-4"
              />
              <button
                type="button"
                onClick={() => setIsAddHospitalOpen(true)}
                className="h-10 shrink-0 rounded-lg bg-[#2E7D5B] px-3 text-sm font-medium text-white hover:bg-[#256B4D]"
              >
                Add hospital
              </button>
              <button
                type="button"
                onClick={() => setIsChatbotPanelOpen(true)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                title="Open chatbot panel"
                aria-label="Open chatbot panel"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        </div>
      ) : null}

      {selectedHospitalIds.length > 0 ? (
        <div className="rounded-2xl border border-[#2E7D5B]/30 bg-[#f3faf6] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-gray-800">
              {selectedHospitalIds.length} selected
            </p>
            <button
              type="button"
              onClick={() => bulkDeleteMutation.mutate()}
              className="h-9 rounded-md border border-red-300 px-3 text-sm text-red-700 hover:bg-red-50"
            >
              Delete selected
            </button>
            <button
              type="button"
              onClick={() => setTagPrompt(`Apply this to selected rows: ${selectedHospitalIds.join(", ")}`)}
              className="h-9 rounded-md border border-[#2E7D5B]/40 px-3 text-sm text-[#2E7D5B] hover:bg-[#e8f5ee]"
            >
              Tag selected for chatbot
            </button>
            <button
              type="button"
              onClick={() => setSelectedHospitalIds([])}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 gap-5">
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-hidden transition-all duration-200 ${
            isChatbotPanelOpen ? "pr-[420px]" : "pr-0"
          }`}
        >
          <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="p-8 text-sm text-gray-500">Loading hospitals...</div>
            ) : isError ? (
              <div className="p-8 text-sm text-red-600">Failed to load hospitals.</div>
            ) : (
              <div className="h-full overflow-auto">
                <table className="min-w-[1100px] w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) =>
                        setSelectedHospitalIds(e.target.checked ? rows.map((row) => row.id) : [])
                      }
                    />
                  </th>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3">Avg wait</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((hospital) => (
                  <tr key={hospital.id} className="align-top">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedHospitalIds.includes(hospital.id)}
                        onChange={(e) => toggleRowSelection(hospital.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      {editingHospitalId === hospital.id ? (
                        <input
                          value={editingHospitalForm.name ?? ""}
                          onChange={(e) =>
                            setEditingHospitalForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{hospital.name}</p>
                      )}
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
                      {editingHospitalId === hospital.id ? (
                        <input
                          value={editingHospitalForm.city ?? ""}
                          onChange={(e) =>
                            setEditingHospitalForm((prev) => ({ ...prev, city: e.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm"
                        />
                      ) : (
                        <p>{hospital.city ?? "-"}</p>
                      )}
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
                          hospital.services.map((service) => (
                            <div key={service.id} className="rounded-md bg-gray-50 px-2 py-1.5">
                              {editingServiceId === service.id ? (
                                <div className="space-y-1">
                                  <input
                                    value={editingServiceForm.specialty}
                                    onChange={(e) =>
                                      setEditingServiceForm((prev) => ({
                                        ...prev,
                                        specialty: e.target.value,
                                      }))
                                    }
                                    placeholder="Specialty"
                                    className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                                  />
                                  <input
                                    value={editingServiceForm.procedureName}
                                    onChange={(e) =>
                                      setEditingServiceForm((prev) => ({
                                        ...prev,
                                        procedureName: e.target.value,
                                      }))
                                    }
                                    placeholder="Procedure"
                                    className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                                  />
                                  <input
                                    value={editingServiceForm.estimatedWaitDays}
                                    onChange={(e) =>
                                      setEditingServiceForm((prev) => ({
                                        ...prev,
                                        estimatedWaitDays: e.target.value,
                                      }))
                                    }
                                    placeholder="Wait days"
                                    className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                      onClick={() =>
                                        updateServiceMutation.mutate({
                                          hospitalId: hospital.id,
                                          serviceId: service.id,
                                        })
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                      onClick={() => setEditingServiceId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs font-semibold text-gray-800">
                                    {service.specialty ?? "-"}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {service.procedureName ?? "-"} | Wait:{" "}
                                    {service.estimatedWaitDays ?? "-"} days | Earliest:{" "}
                                    {formatDate(service.earliestDate)}
                                  </p>
                                  <div className="mt-1 flex gap-1">
                                    <button
                                      type="button"
                                      className="rounded border border-gray-300 px-2 py-0.5 text-xs"
                                      onClick={() => {
                                        setEditingServiceId(service.id);
                                        setEditingServiceForm({
                                          specialty: service.specialty ?? "",
                                          procedureName: service.procedureName ?? "",
                                          estimatedWaitDays:
                                            service.estimatedWaitDays?.toString() ?? "",
                                        });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-700"
                                      onClick={() =>
                                        deleteServiceMutation.mutate({
                                          hospitalId: hospital.id,
                                          serviceId: service.id,
                                        })
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                        {addingServiceForHospitalId === hospital.id ? (
                          <div className="rounded-md border border-dashed border-gray-300 p-2">
                            <input
                              value={newServiceForm.specialty}
                              onChange={(e) =>
                                setNewServiceForm((prev) => ({ ...prev, specialty: e.target.value }))
                              }
                              placeholder="Specialty"
                              className="mb-1 h-8 w-full rounded border border-gray-300 px-2 text-xs"
                            />
                            <input
                              value={newServiceForm.procedureName}
                              onChange={(e) =>
                                setNewServiceForm((prev) => ({
                                  ...prev,
                                  procedureName: e.target.value,
                                }))
                              }
                              placeholder="Procedure"
                              className="mb-1 h-8 w-full rounded border border-gray-300 px-2 text-xs"
                            />
                            <input
                              value={newServiceForm.estimatedWaitDays}
                              onChange={(e) =>
                                setNewServiceForm((prev) => ({
                                  ...prev,
                                  estimatedWaitDays: e.target.value,
                                }))
                              }
                              placeholder="Wait days"
                              className="h-8 w-full rounded border border-gray-300 px-2 text-xs"
                            />
                            <div className="mt-2 flex gap-1">
                              <button
                                type="button"
                                className="rounded border border-gray-300 px-2 py-1 text-xs"
                                onClick={() => addServiceMutation.mutate()}
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                className="rounded border border-gray-300 px-2 py-1 text-xs"
                                onClick={() => setAddingServiceForHospitalId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                            onClick={() => {
                              setAddingServiceForHospitalId(hospital.id);
                              setNewServiceForm({
                                specialty: "",
                                procedureName: "",
                                estimatedWaitDays: "",
                              });
                            }}
                          >
                            Add service
                          </button>
                        )}
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
                    <td className="px-4 py-4">
                      {editingHospitalId === hospital.id ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => updateHospitalMutation.mutate()}
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHospitalId(null);
                              setEditingHospitalForm({});
                            }}
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHospitalId(hospital.id);
                              setEditingHospitalForm({
                                name: hospital.name,
                                city: hospital.city,
                                country: hospital.country,
                                address: hospital.address,
                                phone: hospital.phone,
                                email: hospital.email,
                                website: hospital.website,
                                bedCount: hospital.bedCount,
                                averageWaitDays: hospital.averageWaitDays,
                                notes: hospital.notes,
                              });
                            }}
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHospitalMutation.mutate(hospital.id)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-gray-500" colSpan={8}>
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
        </div>

        <AdminHospitalsChatPanel
            isOpen={isChatbotPanelOpen}
            onClose={() => setIsChatbotPanelOpen(false)}
            selectedHospitalIds={selectedHospitalIds}
            tagPrompt={tagPrompt}
            setTagPrompt={setTagPrompt}
          />
      </div>

      <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add hospital</DialogTitle>
            <DialogDescription>Create a new hospital record for emulator data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Hospital name</label>
              <input
                value={newHospitalName}
                onChange={(e) => setNewHospitalName(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Hospital name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">City</label>
              <input
                value={newHospitalCity}
                onChange={(e) => setNewHospitalCity(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="City"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAddHospitalOpen(false)}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                setErrorMessage(null);
                if (!newHospitalName.trim()) {
                  setErrorMessage("Hospital name is required.");
                  return;
                }
                await createHospitalMutation.mutateAsync();
                setIsAddHospitalOpen(false);
              }}
              className="h-10 rounded-lg bg-[#2E7D5B] px-4 text-sm font-medium text-white hover:bg-[#256B4D]"
            >
              Save hospital
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </section>
  );
}
