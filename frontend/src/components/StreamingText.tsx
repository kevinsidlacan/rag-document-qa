interface Props {
  text: string;
  isStreaming: boolean;
}

export function StreamingText({ text, isStreaming }: Props) {
  return (
    <span>
      {text}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-olive-500 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      )}
    </span>
  );
}
