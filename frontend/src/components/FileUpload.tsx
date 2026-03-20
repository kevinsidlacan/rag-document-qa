import { useState, useCallback } from "react";

interface UploadResult {
  filename: string;
  chunk_count: number;
  message: string;
}

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);

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
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {isUploading ? (
        <p className="text-gray-500">Uploading and processing...</p>
      ) : (
        <>
          <p className="text-gray-500 mb-2">
            Drag & drop a document here, or{" "}
            <label className="text-blue-600 cursor-pointer hover:underline">
              browse
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="text-xs text-gray-400">
            Supports PDF, DOCX, TXT, and MD files
          </p>
        </>
      )}

      {result && (
        <p className="mt-3 text-sm text-green-600">
          {result.message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
