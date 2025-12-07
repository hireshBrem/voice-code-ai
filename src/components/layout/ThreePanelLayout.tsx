'use client';

import { useState } from 'react';
import { FileTree } from '@/components/file-tree/FileTree';
import { FileViewer } from '@/components/file-viewer/FileViewer';
import { VoiceAgentPanel } from '@/components/voice-agent/VoiceAgentPanel';

export function ThreePanelLayout() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [repo, setRepo] = useState<any>(null);

    const handleSelectFile = (content: string, name: string, repo?: any) => {
        setFileContent(content)
        setFileName(name)
        if (repo) setRepo(repo)
        // console.log(content, )
    }

    return (
    <div className="grid grid-cols-[20%_50%_30%] h-screen w-full bg-white dark:bg-black">
        {/* Left Panel - File Tree */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <FileTree onSelectFile={handleSelectFile} />
        </div>

        {/* Middle Panel - File Viewer */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <FileViewer content={fileContent} fileName={fileName} repo={repo} />
        </div>

        {/* Right Panel - Voice Agent */}
        <div className="overflow-hidden">
            <VoiceAgentPanel />
        </div>
    </div>
    )
}
