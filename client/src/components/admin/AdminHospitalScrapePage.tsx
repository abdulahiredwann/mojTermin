import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  Loader2,
  Search,
  TableProperties,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ScrapeRow = {
  rowNum: string;
  routeId: string;
  urgencyFile: string;
  serviceName: string;
  urgencyPage: string;
  region: string;
  serviceUnavailable: string;
  eOrderNotPossible: string;
  provider: string;
  website: string;
  websiteDisabled: string;
  appointmentSummary: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  fax: string;
  lastUpdated: string;
  remarks: string;
  ambulances: string;
  sourceFile: string;
};

type MetaResponse = {
  csvDir: string;
  sourceFiles: string[];
  fileCount: number;
  rowCount: number;
  facets: {
    services: string[];
    urgencies: string[];
    regions: string[];
    cities: string[];
  };
  summary: {
    byService: { name: string; count: number }[];
    byUrgency: { name: string; count: number }[];
    byRegion: { name: string; count: number }[];
    byCity: { name: string; count: number }[];
  };
  sortFields: string[];
};

type RowsResponse = {
  rows: ScrapeRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: { q?: string; service?: string; urgency?: string; region?: string; city?: string };
  sort: string;
  order: "asc" | "desc";
};

const SORTABLE: { label: string; sort: string }[] = [
  { label: "#", sort: "rowNum" },
  { label: "Service", sort: "service" },
  { label: "Urgency", sort: "urgency" },
  { label: "Region", sort: "region" },
  { label: "Hospital", sort: "provider" },
  { label: "City", sort: "city" },
  { label: "Address", sort: "address" },
  { label: "Phone", sort: "phone" },
  { label: "Appointment / wait", sort: "appointment" },
];

function normalizeUrl(href: string) {
  const t = href.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function SortHint({ active, order }: { active: boolean; order: "asc" | "desc" }) {
  if (!active) return <span className="inline-block w-4" />;
  return order === "asc" ? (
    <ArrowUpAZ className="h-3.5 w-3.5 text-[#2E7D5B]" />
  ) : (
    <ArrowDownAZ className="h-3.5 w-3.5 text-[#2E7D5B]" />
  );
}

export function AdminHospitalScrapePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [q, setQ] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [service, setService] = useState("");
  const [urgency, setUrgency] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("rowNum");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [detailRow, setDetailRow] = useState<ScrapeRow | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qDraft.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [qDraft]);

  const metaQuery = useQuery({
    queryKey: ["admin-hospital-scrape-meta"],
    queryFn: async () => {
      const res = await api.get<MetaResponse>("/admin/hospital-scrape/meta");
      return res.data;
    },
  });

  const rowsQuery = useQuery({
    queryKey: [
      "admin-hospital-scrape-rows",
      page,
      limit,
      q,
      service,
      urgency,
      region,
      city,
      sort,
      order,
    ],
    queryFn: async () => {
      const res = await api.get<RowsResponse>("/admin/hospital-scrape/rows", {
        params: {
          page,
          limit,
          q: q || undefined,
          service: service || undefined,
          urgency: urgency || undefined,
          region: region || undefined,
          city: city || undefined,
          sort,
          order,
        },
      });
      return res.data;
    },
    enabled: metaQuery.isSuccess && (metaQuery.data?.rowCount ?? 0) >= 0,
  });

  useEffect(() => {
    setPage(1);
  }, [service, urgency, region, city, limit]);

  const rows = rowsQuery.data?.rows ?? [];
  const pagination = rowsQuery.data?.pagination;

  const headerSort = rowsQuery.data?.sort ?? sort;
  const headerOrder = rowsQuery.data?.order ?? order;

  const toggleSort = (field: string) => {
    if (headerSort === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  function handleRowClick(e: React.MouseEvent<HTMLTableRowElement>, r: ScrapeRow) {
    const el = e.target as HTMLElement | null;
    if (el?.closest("a, button")) return;
    setDetailRow(r);
  }

  const summary = metaQuery.data?.summary;

  const metaLine = useMemo(() => {
    if (!metaQuery.data) return "";
    const { rowCount, fileCount, sourceFiles } = metaQuery.data;
    const filesPreview = sourceFiles.slice(0, 3).join(", ");
    const more = sourceFiles.length > 3 ? ` +${sourceFiles.length - 3} more` : "";
    return `${rowCount.toLocaleString()} rows · ${fileCount} file(s): ${filesPreview}${more}`;
  }, [metaQuery.data]);

  return (
    <section className="flex flex-col gap-4 pb-12">
      {/* Compact header — table stays primary above the fold */}
      <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ee] text-[#2E7D5B]">
            <TableProperties className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Hospital scrape (eZdrav)</h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Search, filter, and sort provider rows from the CSV export.
            </p>
            {metaQuery.isSuccess && metaQuery.data.rowCount > 0 ? (
              <p className="mt-1 text-xs text-gray-500">{metaLine}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label htmlFor="scrape-q" className="text-xs font-medium text-gray-600">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="scrape-q"
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="Hospital, city, service, phone…"
                className="h-10 pl-9"
              />
            </div>
          </div>

          <ScrapeComboboxFilter
            label="Service"
            searchPlaceholder="Filter services…"
            emptyMessage="No service found."
            allLabel="All services"
            options={metaQuery.data?.facets.services ?? []}
            value={service}
            onValueChange={setService}
            disabled={!metaQuery.data?.facets.services.length}
            triggerClassName="min-w-[200px] lg:w-[220px]"
          />

          <ScrapeComboboxFilter
            label="Urgency"
            searchPlaceholder="Filter urgency…"
            emptyMessage="No option found."
            allLabel="All urgencies"
            options={metaQuery.data?.facets.urgencies ?? []}
            value={urgency}
            onValueChange={setUrgency}
            disabled={!metaQuery.data?.facets.urgencies.length}
            triggerClassName="min-w-[160px] lg:w-[180px]"
          />

          <ScrapeComboboxFilter
            label="Region"
            searchPlaceholder="Filter regions…"
            emptyMessage="No region found."
            allLabel="All regions"
            options={metaQuery.data?.facets.regions ?? []}
            value={region}
            onValueChange={setRegion}
            disabled={!metaQuery.data?.facets.regions.length}
            triggerClassName="min-w-[160px] lg:w-[200px]"
          />

          <ScrapeComboboxFilter
            label="City"
            searchPlaceholder="Filter cities…"
            emptyMessage="No city found."
            allLabel="All cities"
            options={metaQuery.data?.facets.cities ?? []}
            value={city}
            onValueChange={setCity}
            disabled={!metaQuery.data?.facets.cities?.length}
            triggerClassName="min-w-[160px] lg:w-[200px]"
          />

          <ScrapeComboboxFilter
            label="Rows per page"
            searchPlaceholder="Filter…"
            emptyMessage="No option found."
            options={["10", "25", "50", "100"]}
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
            allowClear={false}
            formatButtonLabel={(v) => `${v} rows`}
            formatOptionLabel={(v) => `${v} rows`}
            triggerClassName="min-w-[140px] lg:w-[150px]"
          />
        </div>
      </div>

      {metaQuery.isLoading ? (
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dataset summary…
        </div>
      ) : null}

      {metaQuery.isError ? (
        <p className="shrink-0 text-sm text-red-600">Could not load scrape metadata.</p>
      ) : null}

      {metaQuery.data && metaQuery.data.rowCount === 0 ? (
        <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">No CSV rows found.</p>
          <p className="mt-1 text-amber-800/90">
            Place chunked exports as <code className="rounded bg-white/80 px-1">1.csv</code>,{" "}
            <code className="rounded bg-white/80 px-1">2.csv</code>, … under{" "}
            <code className="rounded bg-white/80 px-1">server/scripts/pregled_parts</code>, or set{" "}
            <code className="rounded bg-white/80 px-1">EZDRAV_PREGLED_CSV_DIR</code> on the API.
          </p>
          <p className="mt-2 text-xs text-amber-800/80">
            Resolved directory: <span className="font-mono">{metaQuery.data.csvDir}</span>
          </p>
        </div>
      ) : null}

      {/* Main table: fixed viewport height so it stays readable; scroll inside */}
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
          "h-[min(72vh,calc(100vh-11rem))] min-h-[22rem]",
        )}
      >
        {rowsQuery.isLoading ? (
          <div className="flex flex-1 items-center gap-2 p-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading rows…
          </div>
        ) : rowsQuery.isError ? (
          <div className="flex-1 p-8 text-sm text-red-600">Failed to load rows.</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {SORTABLE.map((col) => (
                    <th key={col.sort} className="whitespace-nowrap px-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.sort)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left hover:bg-gray-100",
                          headerSort === col.sort && "text-[#2E7D5B]",
                        )}
                      >
                        {col.label}
                        <SortHint active={headerSort === col.sort} order={headerOrder} />
                      </button>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-3">Website</th>
                  <th className="whitespace-nowrap px-3 py-3">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr
                    key={`${r.rowNum}-${r.routeId}-${r.provider}-${r.sourceFile}`}
                    className="align-top cursor-pointer transition-colors hover:bg-emerald-50/50"
                    onClick={(e) => handleRowClick(e, r)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setDetailRow(r);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details: ${r.provider || r.serviceName || "row"}`}
                  >
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{r.rowNum || "—"}</td>
                    <td className="max-w-[220px] px-3 py-3 text-gray-900">
                      <span className="line-clamp-2 font-medium" title={r.serviceName}>
                        {r.serviceName || "—"}
                      </span>
                      {r.eOrderNotPossible === "da" ? (
                        <Badge variant="outline" className="mt-1 border-amber-300 text-amber-800">
                          e-order N/A
                        </Badge>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                        {r.urgencyFile || "—"}
                      </span>
                    </td>
                    <td className="max-w-[140px] px-3 py-3 text-gray-700">
                      <span className="line-clamp-2" title={r.region}>
                        {r.region || "—"}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-3 py-3">
                      <p className="font-medium text-gray-900">{r.provider || "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{r.city || "—"}</td>
                    <td className="max-w-[200px] px-3 py-3 text-gray-700">
                      <span className="line-clamp-2" title={[r.address, r.postalCode].filter(Boolean).join(", ")}>
                        {[r.address, r.postalCode].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="max-w-[160px] px-3 py-3 text-gray-800">
                      <span className="line-clamp-2 font-mono text-xs" title={r.phone}>
                        {r.phone || "—"}
                      </span>
                    </td>
                    <td className="max-w-[320px] px-3 py-3 text-gray-800">
                      <span className="line-clamp-3 whitespace-pre-line" title={r.appointmentSummary}>
                        {r.appointmentSummary || "—"}
                      </span>
                    </td>
                    <td className="max-w-[140px] px-3 py-3">
                      {r.website ? (
                        <a
                          href={normalizeUrl(r.website)}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[#2E7D5B] underline-offset-2 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.website.replace(/^https?:\/\//i, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">{r.routeId || "—"}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={11}>
                      No rows match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} ·{" "}
          {(pagination?.total ?? 0).toLocaleString()} matching rows
        </p>
        <div className="flex items-center gap-2">
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

      {/* Grouped stats & file info below the working table */}
      <div className="shrink-0 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Dataset overview</h2>
        {summary ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Top services" items={summary.byService} />
            <SummaryCard title="By urgency" items={summary.byUrgency} />
            <SummaryCard title="Top regions" items={summary.byRegion} />
            <SummaryCard title="Top cities" items={summary.byCity ?? []} />
          </div>
        ) : metaQuery.isSuccess && metaQuery.data.rowCount > 0 ? (
          <p className="text-sm text-gray-500">No summary available.</p>
        ) : null}
      </div>

      <Dialog open={detailRow !== null} onOpenChange={(open) => !open && setDetailRow(null)}>
        {detailRow ? (
          <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-3xl overflow-y-auto p-0 sm:max-h-[90vh]">
            <DialogHeader className="border-b border-gray-100 bg-gray-50/90 px-6 py-4 text-left">
              <DialogTitle className="pr-8 text-xl text-gray-900">
                {detailRow.provider || "Provider details"}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-gray-600">
                {detailRow.serviceName ? (
                  <span className="font-medium text-gray-800">{detailRow.serviceName}</span>
                ) : (
                  "Scraped row from eZdrav export"
                )}
                {detailRow.city ? (
                  <span className="mt-1 block text-gray-600">{detailRow.city}</span>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Row #" value={detailRow.rowNum} />
                <DetailItem label="Service route ID" value={detailRow.routeId} mono />
                <DetailItem label="Urgency (export)" value={detailRow.urgencyFile} />
                <DetailItem label="Urgency (page)" value={detailRow.urgencyPage} />
                <DetailItem label="Region" value={detailRow.region} />
                <DetailItem label="City" value={detailRow.city} />
                <DetailItem label="Service not available" value={detailRow.serviceUnavailable} />
                <DetailItem label="E-ordering not possible" value={detailRow.eOrderNotPossible} />
                <DetailItem label="Website disabled" value={detailRow.websiteDisabled} />
                <DetailItem
                  label="Website"
                  value={detailRow.website}
                  href={detailRow.website ? normalizeUrl(detailRow.website) : undefined}
                />
                <DetailItem label="Postal code" value={detailRow.postalCode} />
                <DetailItem label="Phone" value={detailRow.phone} mono />
                <DetailItem label="Fax" value={detailRow.fax} mono />
                <DetailItem label="Email" value={detailRow.email} />
                <DetailItem label="Last updated (portal)" value={detailRow.lastUpdated} />
                <DetailItem label="Source file" value={detailRow.sourceFile} mono />
                <DetailItem label="Street address" value={detailRow.address} className="sm:col-span-2" />
                <DetailItem
                  label="Appointment / waiting"
                  value={detailRow.appointmentSummary}
                  multiline
                  className="sm:col-span-2"
                />
                <DetailItem label="Remarks" value={detailRow.remarks} multiline className="sm:col-span-2" />
                <DetailItem
                  label="Per-clinic availability"
                  value={detailRow.ambulances}
                  multiline
                  className="sm:col-span-2"
                />
              </dl>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}

function ScrapeComboboxFilter({
  label,
  searchPlaceholder,
  emptyMessage,
  options,
  value,
  onValueChange,
  disabled = false,
  allowClear = true,
  allLabel = "All",
  formatButtonLabel,
  formatOptionLabel = (v) => v,
  triggerClassName,
}: {
  label: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: string[];
  value: string;
  onValueChange: (next: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
  allLabel?: string;
  formatButtonLabel?: (value: string) => string;
  formatOptionLabel?: (value: string) => string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  const buttonLabel = (() => {
    if (allowClear && !value) return allLabel;
    if (formatButtonLabel && value) return formatButtonLabel(value);
    return value || allLabel;
  })();

  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-between rounded-xl border-gray-200 bg-white px-3 text-left text-[14px] font-normal shadow-none hover:bg-gray-50/80",
              triggerClassName,
            )}
          >
            <span className={cn("min-w-0 flex-1 truncate", value || !allowClear ? "text-gray-900" : "text-gray-500")}>
              {buttonLabel}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[100] w-[min(calc(100vw-2rem),28rem)] max-h-[min(420px,70vh)] p-0"
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions
        >
          <Command shouldFilter className="rounded-xl border-0">
            <CommandInput placeholder={searchPlaceholder} className="h-11" />
            <CommandList className="max-h-[min(320px,55vh)]">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {allowClear ? (
                  <CommandItem
                    value={`__all__ ${allLabel}`}
                    className="mojtermin-green-option cursor-pointer rounded-lg text-gray-900"
                    onSelect={() => {
                      onValueChange("");
                      setOpen(false);
                    }}
                  >
                    {allLabel}
                  </CommandItem>
                ) : null}
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    className="mojtermin-green-option cursor-pointer rounded-lg text-gray-900"
                    onSelect={() => {
                      onValueChange(opt);
                      setOpen(false);
                    }}
                  >
                    <span className="line-clamp-4 break-words">{formatOptionLabel(opt)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DetailItem({
  label,
  value,
  multiline,
  mono,
  href,
  className,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  mono?: boolean;
  href?: string;
  className?: string;
}) {
  const display = value?.trim() || "—";
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-gray-900">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-[#2E7D5B] underline-offset-2 hover:underline"
          >
            {display}
          </a>
        ) : (
          <span
            className={cn(
              multiline && "block max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-gray-800",
              mono && "font-mono text-xs",
            )}
          >
            {display}
          </span>
        )}
      </dd>
    </div>
  );
}

function SummaryCard({
  title,
  items,
}: {
  title: string;
  items: { name: string; count: number }[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-sm">
        {items.length === 0 ? (
          <li className="text-gray-400">No data</li>
        ) : (
          items.map((it, i) => (
            <li key={`${it.name}-${i}`} className="flex justify-between gap-2 text-gray-800">
              <span className="min-w-0 truncate" title={it.name}>
                {it.name}
              </span>
              <span className="shrink-0 font-mono text-xs text-gray-500">{it.count.toLocaleString()}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
