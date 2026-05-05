import { X } from "lucide-react";
import { useEffect, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "system";
  text: string;
};

type AdminHospitalsChatPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitalIds: string[];
  tagPrompt: string;
  setTagPrompt: (value: string) => void;
};

export function AdminHospitalsChatPanel({
  isOpen,
  onClose,
  selectedHospitalIds,
  tagPrompt,
  setTagPrompt,
}: AdminHospitalsChatPanelProps) {
  const [chatInput, setChatInput] = useState(tagPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (tagPrompt) {
      setChatInput(tagPrompt);
    }
  }, [tagPrompt]);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    const selectedInfo =
      selectedHospitalIds.length > 0
        ? `Selected rows: ${selectedHospitalIds.join(", ")}`
        : "Selected rows: none";
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text },
      {
        id: `${Date.now()}-system`,
        role: "system",
        text: `Flow saved (no AI yet). ${selectedInfo}`,
      },
    ]);
    setTagPrompt(text);
    setChatInput("");
  };

  const showSelectedContext = selectedHospitalIds.length > 0 && tagPrompt.trim().length > 0;

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] border-l border-gray-200 bg-white shadow-xl">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Chat context</p>
          <p className="mt-1 text-xs text-gray-500">Flow-only panel (AI integration later)</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Close chat panel"
          title="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showSelectedContext ? (
        <div className="border-b border-gray-100 p-3">
          <div className="rounded-lg border border-[#2E7D5B]/20 bg-[#f3faf6] p-2 text-xs text-gray-700">
            Tagged rows: <span className="font-semibold">{selectedHospitalIds.length}</span>
          </div>
        </div>
      ) : null}

      <div className="h-[calc(100%-8.2rem)] space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-500">No chat history yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-xs ${
                msg.role === "user" ? "bg-[#e8f5ee] text-gray-800" : "bg-gray-100 text-gray-700"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            className="h-10 rounded-md bg-[#2E7D5B] px-4 text-sm font-medium text-white hover:bg-[#256B4D]"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
