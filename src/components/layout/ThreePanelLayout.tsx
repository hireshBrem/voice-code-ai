'use client';

import { FileTree } from '@/components/file-tree/FileTree';
import { FileViewer } from '@/components/file-viewer/FileViewer';
import { VoiceAgentPanel } from '@/components/voice-agent/VoiceAgentPanel';
import { FileStorageProvider } from '@/contexts/FileStorageContext';

export function ThreePanelLayout() {
    return (
    <FileStorageProvider>
        <div className="grid grid-cols-[20%_50%_30%] h-screen w-full bg-white dark:bg-black">
            {/* Left Panel - File Tree */}
            <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <FileTree />
            </div>

            {/* Middle Panel - File Viewer */}
            <div className="border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <FileViewer />
            </div>

            {/* Right Panel - Voice Agent */}
            <div className="overflow-hidden">
                <VoiceAgentPanel />
            </div>
        </div>
    </FileStorageProvider>
    )
}
