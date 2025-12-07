'use client';

import { FileTree } from '@/components/file-tree/FileTree';
import { FileViewer } from '@/components/file-viewer/FileViewer';
import { VoiceAgentPanel } from '@/components/voice-agent/VoiceAgentPanel';
import { useState } from 'react';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
    };
}

export function ThreePanelLayout() {
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<any>(null);

    // Centralized GitHub state
    const [token, setToken] = useState('');
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
    const [contents, setContents] = useState<any[]>([]);
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

    const handleContentClick = async (item: any) => {
        if (item.type === 'dir' && selectedRepo) {
            fetchContents(selectedRepo.owner.login, selectedRepo.name, item.path);
        } else if (item.type === 'file' && item.download_url) {
            try {
                const response = await fetch(item.download_url);
                const content = await response.text();
                setFileContent(content);
                setFileName(item.name);
                setSelectedFile({
                    path: item.path,
                    name: item.name,
                    content,
                    repo: selectedRepo?.name,
                    owner: selectedRepo?.owner.login,
                });
            } catch (err) {
                setError('Failed to fetch file content');
            }
        }
    };

    const handleBackToRepos = () => {
        setSelectedRepo(null);
        setContents([]);
    };

    return (
    <div className="grid grid-cols-[20%_50%_30%] h-screen w-full bg-white dark:bg-black">
        {/* Left Panel - File Tree */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <FileTree
                token={token}
                setToken={setToken}
                repos={repos}
                selectedRepo={selectedRepo}
                contents={contents}
                isLoading={isLoading}
                error={error}
                onFetchRepos={fetchRepos}
                onRepoClick={handleRepoClick}
                onContentClick={handleContentClick}
                onBackToRepos={handleBackToRepos}
            />
        </div>

        {/* Middle Panel - File Viewer */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <FileViewer fileContent={fileContent} fileName={fileName} />
        </div>

        {/* Right Panel - Voice Agent */}
        <div className="overflow-hidden">
            <VoiceAgentPanel />
        </div>
    </div>
    )
}
