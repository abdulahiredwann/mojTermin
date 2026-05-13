import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { publicUploadUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Thumbnail buttons + fullscreen-style modal preview (stay on site). */
export function ReferralImagesLightbox({
  paths,
  emptySlot,
  size = "sm",
}: {
  paths: string[];
  emptySlot?: React.ReactNode;
  size?: "sm" | "md";
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
          <button
            key={p}
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
