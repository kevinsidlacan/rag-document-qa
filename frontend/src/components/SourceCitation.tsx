import type { Source } from "../hooks/useChat";

interface Props {
  sources: Source[];
}

export function SourceCitation({ sources }: Props) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-olive-200/60 space-y-1.5">
      <p className="text-[10px] font-semibold text-olive-500 uppercase tracking-widest">
        Sources
      </p>
      {sources.map((source, i) => (
        <details
          key={i}
          className="text-xs bg-white/60 rounded-md border border-olive-200/60 overflow-hidden"
        >
          <summary className="px-2.5 py-1.5 cursor-pointer hover:bg-olive-50 flex justify-between items-center transition-colors">
            <span className="font-medium text-olive-700">
              {source.filename}
              <span className="text-olive-400 font-normal ml-1">
                #{source.chunk_index}
              </span>
            </span>
            <span className="text-[10px] text-olive-400 tabular-nums">
              {(source.score * 100).toFixed(1)}%
            </span>
          </summary>
          <p className="px-2.5 py-2 text-olive-600 whitespace-pre-wrap border-t border-olive-200/40 bg-olive-50/50 leading-relaxed">
            {source.text}
          </p>
        </details>
      ))}
    </div>
  );
}
