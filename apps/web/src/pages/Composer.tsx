import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRequest } from '../api';

const suggestions = [
  'Create a 50-minute lesson plan for 8th grade math on linear equations',
  'Build a vocabulary worksheet for 6th grade ESL students',
  'Design a science quiz on the water cycle for 7th graders',
  'Create differentiated reading materials for a mixed-level ELA class',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}" is not a supported file type. Allowed: PDF, DOCX, TXT, PNG, JPG`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" exceeds the 10 MB size limit`;
  }
  return null;
}

export default function Composer(): React.ReactElement {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const prefill = searchParams.get('prompt');
    if (prefill) setPrompt(prefill);
  }, [searchParams]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const incoming = Array.from(newFiles);
    setError(null);

    for (const file of incoming) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setFiles((prev) => {
      const combined = [...prev, ...incoming];
      if (combined.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return prev;
      }
      return combined;
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createRequest(prompt.trim(), files.length > 0 ? files : undefined);
      navigate(`/workbench/${result.request_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h2 className="page-header">Universal Composer</h2>
            <p className="page-subtitle">Describe what you need — AI generates a complete teaching package</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          <div className="p-1">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create...&#10;&#10;e.g., Create a 50-minute lesson plan for 8th grade math on solving linear equations, including warm-up, guided practice, and exit ticket."
              rows={7}
              className="w-full px-5 py-4 text-gray-900 placeholder-gray-400 resize-y border-0 focus:ring-0 focus:outline-none text-[15px] leading-relaxed"
              disabled={loading}
            />
          </div>

          {/* File Upload Zone */}
          <div
            className={`mx-4 mb-3 border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              dragOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="file-drop-zone"
          >
            {files.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-700"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <span className="text-gray-400 text-xs">{formatFileSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    + Add more files
                  </button>
                )}
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500">
                  Drag & drop files here, or <span className="text-primary-600 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOCX, TXT, PNG, JPG — up to 10 MB each, max 5 files
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
              data-testid="file-input"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span>AI-powered generation</span>
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate Package
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
      </form>

      {/* Suggestions */}
      {!prompt && (
        <div className="mt-8 animate-slide-up">
          <p className="text-sm font-medium text-gray-500 mb-3">Try one of these:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
