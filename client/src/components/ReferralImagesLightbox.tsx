import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { publicUploadUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Thumbnail buttons + fullscreen-style modal preview (stay on site). */
export function ReferralImagesLightbox({
  paths,
  emptySlot,
  size = "sm",
  removable,
  onRemovePath,
  removingPath,
  removeImageAriaLabel,
}: {
  paths: string[];
  emptySlot?: React.ReactNode;
  size?: "sm" | "md";
  /** When set with onRemovePath, each thumb shows a delete control (e.g. pending appointment). */
  removable?: boolean;
  onRemovePath?: (storedRelativePath: string) => void;
  removingPath?: string | null;
  removeImageAriaLabel?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const openPreview = useCallback((storedPath: string) => {
    setPreview(publicUploadUrl(storedPath));
  }, []);

  const thumb =
    size === "md"
      ? "h-14 w-14 sm:h-16 sm:w-16 rounded-md ring-offset-2 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/35"
      : "h-11 w-11 rounded-md ring-offset-2 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/35";

  if (!paths.length) return <>{emptySlot ?? <span className="text-xs text-gray-400">—</span>}</>;

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {paths.map((p) => (
          <div key={p} className="relative inline-flex">
            <button
              type="button"
              onClick={() => openPreview(p)}
              className={cn(
                "overflow-hidden border border-gray-200 bg-white transition-opacity",
                thumb,
              )}
              aria-label="View referral image larger"
            >
              <img src={publicUploadUrl(p)} alt="" className="h-full w-full object-cover" />
            </button>
            {removable && onRemovePath ? (
              <button
                type="button"
                onClick={() => onRemovePath(p)}
                disabled={removingPath === p}
                className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                aria-label={removeImageAriaLabel ?? "Remove image"}
              >
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent
          className={cn(
            "max-h-[92vh] w-[min(96vw,1200px)] max-w-[95vw] gap-0 border-0 bg-zinc-950/95 p-2 shadow-none sm:max-w-[none] sm:rounded-lg",
            "[&>button]:right-3 [&>button]:top-3 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:border-0 [&>button]:bg-white/15 [&>button]:text-white hover:[&>button]:bg-white/25 hover:[&>button]:opacity-100",
          )}
        >
          <DialogTitle className="sr-only">Referral image</DialogTitle>
          {preview ? (
            <img
              src={preview}
              alt=""
              className="mx-auto max-h-[min(85vh,calc(100vh-5rem))] w-full max-w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
