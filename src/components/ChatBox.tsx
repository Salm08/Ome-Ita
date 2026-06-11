"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatBoxProps {
  messages: { from: "me" | "partner"; text: string; time: number }[];
  onSend: (text: string) => void;
  onTyping?: () => void;
  partnerTyping?: boolean;
  compact?: boolean;
}

export function ChatBox({ messages, onSend, onTyping, partnerTyping, compact }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className={`flex flex-col ${compact ? "h-48" : "h-64 sm:h-80"}`}>
      <div className="chat-messages flex-1 overflow-y-auto space-y-2 p-3">
        {messages.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] text-sm py-4">
            Inizia a chattare...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                msg.from === "me"
                  ? "bg-[var(--accent)] text-white rounded-br-md"
                  : "bg-white/10 text-[var(--text-primary)] rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {partnerTyping && (
          <div className="text-xs text-[var(--text-secondary)] italic px-2">
            Sta scrivendo...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-3 border-t border-[var(--border)]">
        <input
          className="input-field flex-1 text-sm"
          placeholder="Scrivi un messaggio..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onTyping?.();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="btn-primary py-2 px-3" disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
