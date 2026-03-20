import { useState, useCallback, useEffect } from "react";

interface UploadResult {
  filename: string;
  chunk_count: number;
  message: string;
}

interface FileUploadProps {
  clearSignal?: number;
}

export function FileUpload({ clearSignal }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clearSignal) {
      setResult(null);
      setError(null);
    }
  }, [clearSignal]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data: UploadResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border border-dashed rounded-lg p-4 text-center transition-all ${
        isDragging
          ? "border-olive-500 bg-olive-100/80 scale-[1.01]"
          : "border-olive-300 hover:border-olive-400 hover:bg-olive-100/40"
      }`}
    >
      {isUploading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-olive-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-olive-600">Processing document...</p>
        </div>
      ) : (
        <p className="text-sm text-olive-500">
          Drop a file here or{" "}
          <label className="text-olive-700 font-medium cursor-pointer hover:text-olive-900 underline underline-offset-2 decoration-olive-300 hover:decoration-olive-500 transition-colors">
            browse
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileInput}
            />
          </label>
          <span className="mx-1.5 text-olive-300">|</span>
          <span className="text-xs text-olive-400">PDF, DOCX, TXT, MD</span>
        </p>
      )}

      {result && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-sm text-olive-700">
          <svg className="w-3.5 h-3.5 text-olive-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {result.filename} — {result.chunk_count} chunks indexed
        </div>
      )}

      {error && (
        <p className="mt-2.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
