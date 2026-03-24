import { useState, useCallback, useEffect } from "react";

interface UploadResult {
  filename: string;
  chunk_count: number;
  message: string;
}

type FileStatus = "uploading" | "success" | "error";

interface FileUploadEntry {
  file: File;
  status: FileStatus;
  result?: UploadResult;
  error?: string;
}

interface FileUploadProps {
  clearSignal?: number;
}

export function FileUpload({ clearSignal }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Map<string, FileUploadEntry>>(new Map());

  const isUploading = [...files.values()].some((f) => f.status === "uploading");

  useEffect(() => {
    if (clearSignal) setFiles(new Map());
  }, [clearSignal]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadSingleFile = useCallback(async (file: File, key: string) => {
    setFiles((prev) => {
      const next = new Map(prev);
      next.set(key, { file, status: "uploading" });
      return next;
    });

    if (file.size > MAX_FILE_SIZE) {
      setFiles((prev) => {
        const next = new Map(prev);
        next.set(key, { file, status: "error", error: "File too large. Maximum size is 10MB." });
        return next;
      });
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
      setFiles((prev) => {
        const next = new Map(prev);
        next.set(key, { file, status: "success", result: data });
        return next;
      });
    } catch (err) {
      setFiles((prev) => {
        const next = new Map(prev);
        next.set(key, {
          file,
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
        return next;
      });
    }
  }, []);

  const uploadFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file, i) => {
        const key = `${file.name}-${Date.now()}-${i}`;
        uploadSingleFile(file, key);
      });
    },
    [uploadSingleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
      e.target.value = "";
    },
    [uploadFiles]
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
      <p className="text-sm text-olive-500">
        {isUploading ? "Processing documents..." : "Drop files here or "}
        {!isUploading && (
          <>
            <label className="text-olive-700 font-medium cursor-pointer hover:text-olive-900 underline underline-offset-2 decoration-olive-300 hover:decoration-olive-500 transition-colors">
              browse
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                multiple
                onChange={handleFileInput}
              />
            </label>
            <span className="mx-1.5 text-olive-300">|</span>
            <span className="text-xs text-olive-400">PDF, DOCX, TXT, MD</span>
          </>
        )}
      </p>

      {files.size > 0 && (
        <ul className="mt-2.5 space-y-1">
          {[...files.values()].map((entry, i) => (
            <li key={i} className="flex items-center justify-center gap-1.5 text-sm">
              {entry.status === "uploading" && (
                <>
                  <div className="w-3 h-3 border-2 border-olive-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-olive-600">{entry.file.name}</span>
                </>
              )}
              {entry.status === "success" && entry.result && (
                <>
                  <svg className="w-3.5 h-3.5 text-olive-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-olive-700">
                    {entry.result.filename} — {entry.result.chunk_count} chunks indexed
                  </span>
                </>
              )}
              {entry.status === "error" && (
                <>
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-600">
                    {entry.file.name} — {entry.error}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
