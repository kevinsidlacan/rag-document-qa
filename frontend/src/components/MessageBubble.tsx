import type { Message } from "../hooks/useChat";
import { SourceCitation } from "./SourceCitation";
import { StreamingText } from "./StreamingText";

interface Props {
  message: Message;
  isStreaming: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-olive-700 text-olive-50"
            : "bg-olive-100/70 text-olive-900 border border-olive-200/60"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="whitespace-pre-wrap">
              <StreamingText
                text={message.content}
                isStreaming={isStreaming}
              />
            </div>
            {message.sources && message.sources.length > 0 && (
              <SourceCitation sources={message.sources} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
