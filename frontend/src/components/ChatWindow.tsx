import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { FileUpload } from "./FileUpload";

export function ChatWindow() {
  const { messages, isStreaming, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const [uploadClearSignal, setUploadClearSignal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isStreaming) return;
    setInput("");
    setUploadClearSignal((s) => s + 1);
    sendMessage(query);
  };

  const handleClear = () => {
    clearMessages();
    setUploadClearSignal((s) => s + 1);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white shadow-sm border-x border-olive-200/60">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-olive-200/60 bg-olive-950">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-olive-400 shadow-[0_0_6px_var(--color-olive-400)]" />
          <h1 className="text-base font-medium tracking-tight text-olive-100">
            Document Q&A
          </h1>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-olive-400 hover:text-olive-200 transition-colors uppercase tracking-widest"
        >
          Clear
        </button>
      </header>

      {/* Upload area */}
      <div className="px-6 py-4 border-b border-olive-200/60 bg-olive-50/50">
        <FileUpload clearSignal={uploadClearSignal} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-white to-olive-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <div className="w-10 h-10 rounded-full border-2 border-olive-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-olive-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-sm text-olive-700 font-medium">
              Upload a document to get started
            </p>
            <p className="text-xs text-olive-400">
              Then ask questions about its contents
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 border-t border-olive-200/60 bg-white flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 rounded-lg border border-olive-200 bg-olive-50/50 px-4 py-2.5 text-sm text-olive-900 placeholder:text-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-400 transition-all"
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-lg bg-olive-700 px-5 py-2.5 text-sm text-olive-100 font-medium hover:bg-olive-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
