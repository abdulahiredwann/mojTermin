import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

export function FloatingChatDemo() {
  const { t, locale } = useLanguage();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const resetWelcome = useCallback(() => {
    setMessages([{ id: "welcome", role: "assistant", text: t.chatWelcome }]);
  }, [t.chatWelcome]);

  useEffect(() => {
    resetWelcome();
  }, [locale, resetWelcome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    const userId = `u-${Date.now()}`;
    setMessages((m) => [...m, { id: userId, role: "user", text }]);
    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", text: t.chatDemoReply }]);
    setPending(false);
  }

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open ? (
        <>
          <button
            type="button"
            aria-label={t.chatFabCloseAria}
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[1px] md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={panelId}
            className="relative z-[100] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/15"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-[#f6fbf8] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2E7D5B] text-white">
                  <Bot className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p id={panelId} className="truncate text-sm font-semibold text-gray-900">
                    {t.chatTitle}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#2E7D5B]">{t.chatBadge}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-900"
                aria-label={t.chatFabCloseAria}
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div ref={listRef} className="max-h-[min(52vh,320px)] space-y-3 overflow-y-auto px-3 py-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-[#2E7D5B] text-white"
                        : "rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {pending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    …
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSend} className="border-t border-gray-100 p-2">
              <div className="flex gap-1.5">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  maxLength={500}
                  autoComplete="off"
                  className="h-10 flex-1 rounded-xl border-gray-200 text-sm focus-visible:ring-[#2E7D5B]/30"
                  disabled={pending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={pending || !input.trim()}
                  className="h-10 w-10 shrink-0 rounded-xl bg-[#2E7D5B] hover:bg-[#256B4D]"
                  aria-label={t.chatSendAria}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      <Button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-label={open ? t.chatFabCloseAria : t.chatFabOpenAria}
        className={`h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          open ? "bg-gray-800 hover:bg-gray-900" : "bg-[#2E7D5B] hover:bg-[#256B4D]"
        }`}
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />}
      </Button>
    </div>
  );
}
