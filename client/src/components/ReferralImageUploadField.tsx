import { useEffect, useMemo } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const MAX_REFERRAL_IMAGES = 15;
/** Must match server `MAX_SEARCH_REFERRAL_IMAGES` for POST /search */
export const MAX_SEARCH_REFERRAL_IMAGES = 8;

export type ReferralImageUploadLabels = {
  label: string;
  hint?: string;
  dropzoneCta?: string;
  dropzoneSubtext?: string;
  photosAdded?: string;
  removeFromListAria: string;
  searchLimitNote: string;
};

type ReferralImageUploadFieldProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  labels: ReferralImageUploadLabels;
  id?: string;
  variant?: "default" | "dropzone";
};

function usePreviewUrls(files: File[]) {
  const urls = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const { url } of urls) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return urls;
}

export function ReferralImageUploadField({
  files,
  onFilesChange,
  labels,
  id = "referral-images",
  variant = "default",
}: ReferralImageUploadFieldProps) {
  const previews = usePreviewUrls(files);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (incoming.length === 0) return;
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= MAX_REFERRAL_IMAGES) break;
      next.push(file);
    }
    onFilesChange(next);
  }

  function removeAt(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  if (variant === "dropzone") {
    const countLabel =
      files.length > 0 && labels.photosAdded
        ? labels.photosAdded.replace("{count}", String(files.length))
        : null;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{labels.label}</p>
        <label
          htmlFor={id}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 transition-colors",
            files.length > 0
              ? "border-[#2E7D5B]/30 bg-[#f6fbf8]/80 hover:border-[#2E7D5B]/45"
              : "border-gray-200 bg-gray-50/80 hover:border-[#2E7D5B]/35 hover:bg-[#f6fbf8]",
          )}
        >
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f5ee] text-[#2E7D5B] transition-colors group-hover:bg-[#d7ebdc]">
            <ImagePlus className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-[#256B4D]">
            {labels.dropzoneCta ?? "Add photos"}
          </span>
          {labels.dropzoneSubtext ? (
            <span className="mt-0.5 text-xs text-gray-500">{labels.dropzoneSubtext}</span>
          ) : null}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="sr-only"
        />

        {files.length > 0 ? (
          <div className="space-y-2">
            {countLabel ? (
              <p className="text-xs font-medium text-gray-600">{countLabel}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {previews.map(({ file, url }, i) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
                  className="group/thumb relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/75 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100 focus:opacity-100"
                    aria-label={labels.removeFromListAria}
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              ))}
              {files.length < MAX_REFERRAL_IMAGES ? (
                <label
                  htmlFor={id}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-[#2E7D5B]/40 hover:text-[#2E7D5B]"
                >
                  <ImagePlus className="h-5 w-5" aria-hidden />
                </label>
              ) : null}
            </div>
          </div>
        ) : null}

        {files.length > MAX_SEARCH_REFERRAL_IMAGES ? (
          <p className="text-[11px] leading-snug text-amber-800">{labels.searchLimitNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm text-gray-700">
        <Upload className="h-4 w-4 text-[#2E7D5B]" aria-hidden />
        {labels.label}
      </Label>
      <Input
        id={id}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8f5ee] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2E7D5B]"
      />
      {labels.hint ? <p className="text-xs text-gray-500">{labels.hint}</p> : null}
      {files.length > 0 ? (
        <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
              className="flex items-center justify-between gap-2 text-xs text-gray-800"
            >
              <span className="min-w-0 truncate font-medium">{f.name}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-transparent p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                aria-label={labels.removeFromListAria}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {files.length > MAX_SEARCH_REFERRAL_IMAGES ? (
        <p className="text-[11px] leading-snug text-amber-900/90">{labels.searchLimitNote}</p>
      ) : null}
    </div>
  );
}
