import { useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "system";
  text: string;
};

type AdminHospitalsChatPanelProps = {
  isOpen: boolean;
  selectedHospitalIds: string[];
  tagPrompt: string;
  setTagPrompt: (value: string) => void;
};

export function AdminHospitalsChatPanel({
  isOpen,
  selectedHospitalIds,
  tagPrompt,
  setTagPrompt,
}: AdminHospitalsChatPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const panelClass = useMemo(
    () =>
      isOpen
        ? "w-[360px] min-w-[360px] opacity-100"
        : "w-0 min-w-0 opacity-0 pointer-events-none overflow-hidden",
    [isOpen]
  );

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

  return (
    <aside
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ${panelClass}`}
    >
      <div className="border-b border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-900">Chat context</p>
        <p className="mt-1 text-xs text-gray-500">Flow-only panel (AI integration later)</p>
      </div>

      <div className="border-b border-gray-100 p-4">
        <div className="mb-2 rounded-lg border border-[#2E7D5B]/20 bg-[#f3faf6] p-2 text-xs text-gray-700">
          Selected rows: <span className="font-semibold">{selectedHospitalIds.length}</span>
        </div>
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type instruction..."
            className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            className="h-9 rounded-md bg-[#2E7D5B] px-3 text-xs font-medium text-white hover:bg-[#256B4D]"
          >
            Send
          </button>
        </div>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto p-4">
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

      <div className="border-t border-gray-100 p-4">
        <textarea
          value={tagPrompt}
          onChange={(e) => setTagPrompt(e.target.value)}
          rows={4}
          placeholder="Tagged context for selected rows..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs"
        />
      </div>
    </aside>
  );
}
