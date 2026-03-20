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
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
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
