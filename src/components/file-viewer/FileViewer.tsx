import { useFileStorage } from '@/contexts/FileStorageContext';

export function FileViewer() {
  const { fileContent, fileName } = useFileStorage();

  if (!fileContent) {
    return (
      <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 font-mono">
            Select a file to view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      {fileName && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
            {fileName}
          </span>
          {fileContent && (
            <button
            //   onClick={handleSave}
              disabled={false}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Save
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {fileContent}
        </pre>
      </div>
    </div>
  );
}
