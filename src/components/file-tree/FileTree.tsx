'use client';

import { useState } from 'react';
import { FileTreeProps } from './types';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
}

export function FileTree({ className = '', onSelectFile }: FileTreeProps & { onSelectFile?: (content: string, fileName: string) => void }) {
  const [token, setToken] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async () => {
    if (!token) {
      setError('Please enter a GitHub PAT token');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch repos');
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContents = async (owner: string, repo: string, path: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch contents');
      const data = await response.json();
      setContents(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepoClick = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    fetchContents(repo.owner.login, repo.name);
  };

  const handleContentClick = async (item: GitHubContent) => {
    if (item.type === 'dir' && selectedRepo) {
      fetchContents(selectedRepo.owner.login, selectedRepo.name, item.path);
    } else if (item.type === 'file' && item.download_url && onSelectFile) {
      try {
        const response = await fetch(item.download_url);
        const content = await response.text();
        onSelectFile(content, item.name);
      } catch (err) {
        setError('Failed to fetch file content');
      }
    }
  };

  const handleBack = () => {
    if (contents.length > 0 && selectedRepo) {
      const currentPath = contents[0]?.path || '';
      const parentPath = currentPath.split('/').slice(0, -2).join('/');
      if (parentPath) {
        fetchContents(selectedRepo.owner.login, selectedRepo.name, parentPath);
      } else {
        fetchContents(selectedRepo.owner.login, selectedRepo.name);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-black ${className}`}>
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h2 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          GitHub Explorer
        </h2>
      </div>

      {!repos.length && (
        <div className="p-4 space-y-3">
          <input
            type="password"
            placeholder="GitHub PAT Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
          <button
            onClick={fetchRepos}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Fetch Repos'}
          </button>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      <div className="overflow-y-auto flex-1">
        {repos.length > 0 && !selectedRepo && (
          <div>
            {repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => handleRepoClick(repo)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
              >
                <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{repo.name}</span>
                {repo.private && (
                  <span className="text-xs px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
                    private
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedRepo && (
          <div>
            <div
              onClick={() => { setSelectedRepo(null); setContents([]); }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm border-b border-zinc-200 dark:border-zinc-800"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{selectedRepo.name}</span>
            </div>
            {contents.map((item) => (
              <div
                key={item.path}
                onClick={() => handleContentClick(item)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
              >
                {item.type === 'dir' ? (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h4a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1h4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
