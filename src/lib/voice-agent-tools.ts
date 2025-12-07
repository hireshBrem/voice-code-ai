import { FileData } from '@/contexts/FileStorageContext';

export interface InsertCodeParams {
  code: string;
  position?: 'cursor' | 'start' | 'end' | string; // string for "line:X"
  filePath?: string; // Optional, defaults to current file
}

export interface ReplaceCodeParams {
  oldCode: string;
  newCode: string;
  filePath?: string; // Optional, defaults to current file
}

export interface DeleteCodeParams {
  target: string; // Exact code snippet, "selection", or "line:X"
  filePath?: string; // Optional, defaults to current file
}

export interface CreateFileParams {
  filename: string;
  content?: string;
  path?: string; // Optional folder path
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Client-side tool implementations for ElevenLabs voice agent
 */
export class VoiceAgentTools {
  private getFile: (path: string) => FileData | undefined;
  private updateFile: (path: string, content: string) => void;
  private addFile: (file: FileData) => void;
  private deleteFile: (path: string) => void;
  private currentFile: FileData | null;

  constructor(
    getFile: (path: string) => FileData | undefined,
    updateFile: (path: string, content: string) => void,
    addFile: (file: FileData) => void,
    deleteFile: (path: string) => void,
    currentFile: FileData | null
  ) {
    this.getFile = getFile;
    this.updateFile = updateFile;
    this.addFile = addFile;
    this.deleteFile = deleteFile;
    this.currentFile = currentFile;
  }

  /**
   * Insert code at a specific position
   */
  insertCode(params: InsertCodeParams): ToolResult {
    try {
      const filePath = params.filePath || this.currentFile?.path;
      if (!filePath) {
        return { success: false, message: 'No file selected' };
      }

      const file = this.getFile(filePath);
      if (!file) {
        return { success: false, message: `File not found: ${filePath}` };
      }

      let newContent = file.content;
      const position = params.position || 'cursor';

      if (position === 'start') {
        newContent = params.code + '\n' + file.content;
      } else if (position === 'end') {
        newContent = file.content + '\n' + params.code;
      } else if (position.startsWith('line:')) {
        const lineNum = parseInt(position.split(':')[1], 10);
        const lines = file.content.split('\n');
        if (lineNum < 1 || lineNum > lines.length + 1) {
          return { success: false, message: `Invalid line number: ${lineNum}` };
        }
        lines.splice(lineNum - 1, 0, params.code);
        newContent = lines.join('\n');
      } else {
        // Default to end if cursor position is not available
        newContent = file.content + '\n' + params.code;
      }

      this.updateFile(filePath, newContent);
      return {
        success: true,
        message: `Code inserted at ${position} in ${file.name}`,
        data: { filePath, position },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error inserting code: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Replace existing code with new code
   */
  replaceCode(params: ReplaceCodeParams): ToolResult {
    try {
      const filePath = params.filePath || this.currentFile?.path;
      if (!filePath) {
        return { success: false, message: 'No file selected' };
      }

      const file = this.getFile(filePath);
      if (!file) {
        return { success: false, message: `File not found: ${filePath}` };
      }

      if (!file.content.includes(params.oldCode)) {
        return {
          success: false,
          message: `Code not found in ${file.name}. Make sure the code matches exactly, including whitespace.`,
        };
      }

      const newContent = file.content.replace(params.oldCode, params.newCode);
      this.updateFile(filePath, newContent);

      return {
        success: true,
        message: `Code replaced in ${file.name}`,
        data: { filePath },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error replacing code: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Delete code from a file
   */
  deleteCode(params: DeleteCodeParams): ToolResult {
    try {
      const filePath = params.filePath || this.currentFile?.path;
      if (!filePath) {
        return { success: false, message: 'No file selected' };
      }

      const file = this.getFile(filePath);
      if (!file) {
        return { success: false, message: `File not found: ${filePath}` };
      }

      let newContent = file.content;

      if (params.target.startsWith('line:')) {
        const lineNum = parseInt(params.target.split(':')[1], 10);
        const lines = file.content.split('\n');
        if (lineNum < 1 || lineNum > lines.length) {
          return { success: false, message: `Invalid line number: ${lineNum}` };
        }
        lines.splice(lineNum - 1, 1);
        newContent = lines.join('\n');
      } else if (params.target === 'selection') {
        return {
          success: false,
          message: 'Selection deletion not supported in voice mode. Please specify exact code or line number.',
        };
      } else {
        // Exact code snippet
        if (!file.content.includes(params.target)) {
          return {
            success: false,
            message: `Code not found in ${file.name}. Make sure the code matches exactly.`,
          };
        }
        newContent = file.content.replace(params.target, '');
      }

      this.updateFile(filePath, newContent);
      return {
        success: true,
        message: `Code deleted from ${file.name}`,
        data: { filePath },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error deleting code: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create a new file
   */
  createFile(params: CreateFileParams): ToolResult {
    try {
      const fullPath = params.path
        ? `${params.path}/${params.filename}`
        : params.filename;

      // Check if file already exists
      if (this.getFile(fullPath)) {
        return { success: false, message: `File already exists: ${fullPath}` };
      }

      const newFile: FileData = {
        path: fullPath,
        name: params.filename,
        content: params.content || '',
      };

      this.addFile(newFile);
      return {
        success: true,
        message: `File created: ${params.filename}`,
        data: { filePath: fullPath },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all files in storage
   */
  listFiles(): ToolResult {
    try {
      // This would need access to getAllFiles from context
      return {
        success: true,
        message: 'File listing requires getAllFiles method',
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        message: `Error listing files: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Search for files by name or content
   */
  searchFiles(query: string): ToolResult {
    try {
      // This would need access to getAllFiles from context
      return {
        success: true,
        message: 'File search requires getAllFiles method',
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        message: `Error searching files: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Read file content
   */
  readFile(filePath: string): ToolResult {
    try {
      const file = this.getFile(filePath);
      if (!file) {
        return { success: false, message: `File not found: ${filePath}` };
      }

      return {
        success: true,
        message: `File content retrieved: ${file.name}`,
        data: { content: file.content, name: file.name, path: file.path },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
