import type { Source } from "../hooks/useChat";

interface Props {
  sources: Source[];
}

export function SourceCitation({ sources }: Props) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Sources
      </p>
      {sources.map((source, i) => (
        <details
          key={i}
          className="text-xs bg-gray-50 rounded border border-gray-200"
        >
          <summary className="px-2 py-1 cursor-pointer hover:bg-gray-100 flex justify-between">
            <span className="font-medium text-gray-700">
              {source.filename} (chunk {source.chunk_index})
            </span>
            <span className="text-gray-400">
              {(source.score * 100).toFixed(1)}% match
            </span>
          </summary>
          <p className="px-2 py-1 text-gray-600 whitespace-pre-wrap border-t border-gray-200">
            {source.text}
          </p>
        </details>
      ))}
    </div>
  );
}
