import { ArrowLeft, MessageSquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

export type HospitalChatMessageVm = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type HospitalChatSessionVm = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminHospitalsChatPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitalIds: string[];
  tagPrompt: string;
  setTagPrompt: (value: string) => void;
  /** Active conversation id (persists server-side per admin) */
  contextId: string | null;
  sessions: HospitalChatSessionVm[];
  isLoadingSessions?: boolean;
  onSelectSession: (contextId: string) => void;
  /** Thread loaded from API */
  messages: HospitalChatMessageVm[];
  isLoadingMessages?: boolean;
  isStartingSession?: boolean;
  onNewChat: () => void;
  /** Persists user + assistant via API; parent refetches messages */
  onSubmitMessage: (text: string) => Promise<void>;
};

export function AdminHospitalsChatPanel({
  isOpen,
  onClose,
  selectedHospitalIds,
  tagPrompt,
  setTagPrompt,
  contextId,
  sessions,
  isLoadingSessions,
  onSelectSession,
  messages,
  isLoadingMessages,
  isStartingSession,
  onNewChat,
  onSubmitMessage,
}: AdminHospitalsChatPanelProps) {
  const [chatInput, setChatInput] = useState(tagPrompt);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    // Only seed the input from tagPrompt when the input is empty.
    // Otherwise it will overwrite the user's next message (and also prevents clearing on send).
    if (tagPrompt && !chatInput.trim() && !sending) {
      setChatInput(tagPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagPrompt, sending]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || sending || !contextId) return;

    setSendError(null);
    setSending(true);
    try {
      await onSubmitMessage(text);
      setChatInput("");
    } catch {
      setSendError(
        "Could not reach the assistant. Check network or server configuration.",
      );
    } finally {
      setSending(false);
    }
  };

  const showSelectedContext =
    selectedHospitalIds.length > 0 && tagPrompt.trim().length > 0;
  const ready = Boolean(contextId) && !isStartingSession;

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  };

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] border-l border-gray-200 bg-white shadow-xl">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {showSessions ? "Chat history" : "Hospital assistant"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {showSessions
              ? "Pick a previous conversation."
              : "Your chat is saved. Use History to reopen older chats."}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!showSessions ? (
            <button
              type="button"
              onClick={() => setShowSessions(true)}
              className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
              title="Open chat history"
              aria-label="Open chat history"
            >
              History
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSessions(false)}
              className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
              title="Back to chat"
              aria-label="Back to chat"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSendError(null);
              onNewChat();
              setShowSessions(false);
            }}
            disabled={isStartingSession}
            className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Start a new conversation"
            aria-label="New chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close chat panel"
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showSelectedContext ? (
        <div className="border-b border-gray-100 p-3">
          <div className="rounded-lg border border-[#2E7D5B]/20 bg-[#f3faf6] p-2 text-xs text-gray-700">
            Tagged rows:{" "}
            <span className="font-semibold">{selectedHospitalIds.length}</span>
          </div>
        </div>
      ) : null}

      {showSessions ? (
        <div className="h-[calc(100%-9rem)] overflow-y-auto p-2">
          {isLoadingSessions ? (
            <p className="p-3 text-xs text-gray-500">Loading conversations…</p>
          ) : sessions.length === 0 ? (
            <p className="p-3 text-xs text-gray-500">No previous conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => {
                const isActive = s.id === contextId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSession(s.id);
                      setShowSessions(false);
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-[#2E7D5B]/40 bg-[#f3faf6]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {s.title?.trim() ? s.title : "Untitled chat"}
                      </p>
                      <p className="shrink-0 text-xs text-gray-500">{formatDay(s.createdAt)}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      Updated {formatDay(s.updatedAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="h-[calc(100%-9rem)] overflow-y-auto bg-[#f5f7f9] p-4">
          {isStartingSession || (!ready && isLoadingMessages) ? (
            <p className="text-xs text-gray-500">Starting chat session…</p>
          ) : null}
          {!isStartingSession && ready && isLoadingMessages && messages.length === 0 ? (
            <p className="text-xs text-gray-500">Loading messages…</p>
          ) : null}
          {!isLoadingMessages && ready && messages.length === 0 ? (
            <p className="text-xs text-gray-500">No messages yet. Describe hospitals to add.</p>
          ) : null}
          <div className="space-y-2">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? "rounded-br-sm bg-[#2E7D5B] text-white"
                        : "rounded-bl-sm bg-white text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 p-3">
        {sendError ? (
          <p className="mb-2 text-xs text-red-600">{sendError}</p>
        ) : null}
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSend();
            }}
            placeholder={ready ? "Type a message…" : "Waiting for session…"}
            disabled={sending || !ready || showSessions}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !ready || showSessions}
            className="h-10 shrink-0 rounded-md bg-[#2E7D5B] px-4 text-sm font-medium text-white hover:bg-[#256B4D] disabled:opacity-60"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </aside>
  );
}
