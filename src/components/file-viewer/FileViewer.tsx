'use client';
    
export function FileViewer({ fileContent, fileName }: { fileContent: string, fileName: string }) {

  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      {fileName && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
            {fileName}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {fileContent}
        </pre>
      </div>
    </div>
  )
  }
