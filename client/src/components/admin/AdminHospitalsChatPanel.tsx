import { useEffect, useState } from "react";

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
    <aside className="fixed right-6 top-24 z-50 h-[calc(100vh-8rem)] w-[360px] rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-900">Chat context</p>
        <p className="mt-1 text-xs text-gray-500">Flow-only panel (AI integration later)</p>
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
