interface Props {
  text: string;
  isStreaming: boolean;
}

export function StreamingText({ text, isStreaming }: Props) {
  return (
    <span>
      {text}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-0.5 align-text-bottom" />
      )}
    </span>
  );
}
