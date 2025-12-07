'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface FileData {
  path: string;
  name: string;
  content: string;
  repo?: string;
  owner?: string;
  language?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
}

interface FileStorageContextType {
  // File storage
  files: Map<string, FileData>;
  addFile: (file: FileData) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  getFile: (path: string) => FileData | undefined;
  getAllFiles: () => FileData[];

  // Current file viewing state
  currentFile: FileData | null;
  setCurrentFile: (file: FileData | null) => void;

  // For FileViewer display
  fileContent: string | null;
  fileName: string | null;
  setFileContent: (content: string | null) => void;
  setFileName: (name: string | null) => void;

  // GitHub integration
  githubToken: string | null;
  setGithubToken: (token: string) => void;
  currentRepo: { owner: string; name: string } | null;
  setCurrentRepo: (repo: { owner: string; name: string } | null) => void;
}

const FileStorageContext = createContext<FileStorageContextType | undefined>(undefined);

export function FileStorageProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Map<string, FileData>>(new Map());
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; name: string } | null>(null);

  const addFile = useCallback((file: FileData) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      newFiles.set(file.path, file);
      return newFiles;
    });
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      const file = newFiles.get(path);
      if (file) {
        newFiles.set(path, { ...file, content });
        // Update currentFile and viewer if it's the same file
        if (currentFile?.path === path) {
          const updatedFile = { ...file, content };
          setCurrentFile(updatedFile);
          setFileContent(content);
        }
      }
      return newFiles;
    });
  }, [currentFile]);

  const deleteFile = useCallback((path: string) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      newFiles.delete(path);
      return newFiles;
    });
    if (currentFile?.path === path) {
      setCurrentFile(null);
      setFileContent(null);
      setFileName(null);
    }
  }, [currentFile]);

  const getFile = useCallback((path: string) => {
    return files.get(path);
  }, [files]);

  const getAllFiles = useCallback(() => {
    return Array.from(files.values());
  }, [files]);

  return (
    <FileStorageContext.Provider
      value={{
        files,
        currentFile,
        setCurrentFile,
        addFile,
        updateFile,
        deleteFile,
        getFile,
        getAllFiles,
        fileContent,
        fileName,
        setFileContent,
        setFileName,
        githubToken,
        setGithubToken,
        currentRepo,
        setCurrentRepo,
      }}
    >
      {children}
    </FileStorageContext.Provider>
  );
}

export function useFileStorage() {
  const context = useContext(FileStorageContext);
  if (!context) {
    throw new Error('useFileStorage must be used within FileStorageProvider');
  }
  return context;
}
