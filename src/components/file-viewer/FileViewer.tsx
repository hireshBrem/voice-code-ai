'use client';

import { useState } from 'react';
import { saveRepoToRedis } from '@/app/action';

interface FileViewerProps {
  content?: string | null;
  fileName?: string | null;
  repo?: any;
}

export function FileViewer({ content, fileName, repo }: FileViewerProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!repo) return;
    setIsSaving(true);
    try {
      await saveRepoToRedis(repo);
    } catch (error) {
      console.error('Failed to save repo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!content) {
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
          {repo && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
}
