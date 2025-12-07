# ElevenLabs Voice Agent Setup

This document explains how to configure your ElevenLabs agent to work with the Voice Code AI application.

## Prerequisites

1. An ElevenLabs account with access to Conversational AI
2. Your agent ID (format: `agent_xxxxxxxxxxxxxxxxxxxxx`)

## Environment Configuration

Your agent ID is already configured in `.env.local`:

```env
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_6101kbw9qm5aea2rwz1dcdfmesmn
```

## Client-Side Tools Configuration

The following client-side tools are automatically registered with your ElevenLabs agent when the voice session starts:

### 1. **insertCode**
Inserts code at a specific position in a file.

**Parameters:**
- `code` (string, required): The code snippet to insert
- `position` (string, optional): Where to insert - `"cursor"` (default), `"start"`, `"end"`, or `"line:X"`
- `filePath` (string, optional): File path (defaults to current file)

**Example usage in ElevenLabs:**
```json
{
  "code": "console.log('Hello World');",
  "position": "end",
  "filePath": "src/App.tsx"
}
```

### 2. **replaceCode**
Replaces existing code with new code.

**Parameters:**
- `oldCode` (string, required): Exact code to find (must match including whitespace)
- `newCode` (string, required): Replacement code
- `filePath` (string, optional): File path (defaults to current file)

**Example usage in ElevenLabs:**
```json
{
  "oldCode": "var x = 5;",
  "newCode": "const x = 5;",
  "filePath": "src/App.tsx"
}
```

### 3. **deleteCode**
Deletes code from a file.

**Parameters:**
- `target` (string, required): What to delete - exact code snippet or `"line:X"`
- `filePath` (string, optional): File path (defaults to current file)

**Example usage in ElevenLabs:**
```json
{
  "target": "console.log('debug');",
  "filePath": "src/App.tsx"
}
```

Or to delete a specific line:
```json
{
  "target": "line:42",
  "filePath": "src/App.tsx"
}
```

### 4. **createFile**
Creates a new file.

**Parameters:**
- `filename` (string, required): Name with extension (e.g., "utils.js")
- `content` (string, optional): Initial content
- `path` (string, optional): Folder path

**Example usage in ElevenLabs:**
```json
{
  "filename": "utils.ts",
  "content": "export function helper() {\n  return true;\n}",
  "path": "src/lib"
}
```

### 5. **readFile** 🔄 (Smart GitHub Fetching)
Reads file content intelligently. First checks if the file is already loaded, otherwise automatically fetches it from GitHub.

**How it works:**
1. Checks if file is cached in client state
2. If not found, automatically fetches from GitHub using saved token/repo
3. Stores the file for future use and displays it in the viewer

**Prerequisites:** A GitHub repository must be loaded in the file tree (left panel) before using this tool.

**Parameters:**
- `filePath` (string, required): Path to the file within the repository (e.g., "src/App.tsx")

**Example usage in ElevenLabs:**
```json
{
  "filePath": "src/App.tsx"
}
```

**Note:** This tool uses the same GitHub API approach as clicking files in the UI, so it seamlessly integrates with your workflow.

### 6. **listFiles**
Lists all files currently loaded in the application.

**Parameters:** None

**Returns:** A list of all files with their names and paths.

### 7. **searchFiles**
Searches for files by name or content.

**Parameters:**
- `query` (string, required): Search query

**Example usage in ElevenLabs:**
```json
{
  "query": "useState"
}
```

## Configuring Your ElevenLabs Agent

To configure these tools in your ElevenLabs agent:

1. Go to [ElevenLabs Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Select your agent (ID: `agent_6101kbw9qm5aea2rwz1dcdfmesmn`)
3. Navigate to the "Client Tools" section
4. Add each of the 7 tools listed above with their respective parameters

### Tool Definitions for ElevenLabs

Here are the tool definitions you should add to your ElevenLabs agent:

#### insertCode
```
Name: insertCode
Description: Inserts code at a specific position in a file
Parameters:
  - code (string, required): The code snippet to insert
  - position (string, optional): Position where to insert: "cursor", "start", "end", or "line:X"
  - filePath (string, optional): File path (defaults to current file)
```

#### replaceCode
```
Name: replaceCode
Description: Replaces existing code with new code
Parameters:
  - oldCode (string, required): Exact code to find and replace
  - newCode (string, required): New code to replace with
  - filePath (string, optional): File path (defaults to current file)
```

#### deleteCode
```
Name: deleteCode
Description: Deletes code from a file
Parameters:
  - target (string, required): Code to delete or "line:X" for specific line
  - filePath (string, optional): File path (defaults to current file)
```

#### createFile
```
Name: createFile
Description: Creates a new file in the project
Parameters:
  - filename (string, required): File name with extension
  - content (string, optional): Initial file content
  - path (string, optional): Folder path for the file
```

#### readFile
```
Name: readFile
Description: Reads and returns the content of a file. Automatically fetches from GitHub if not cached.
Parameters:
  - filePath (string, required): Path to the file within the repository (e.g., "src/App.tsx")
```

#### listFiles
```
Name: listFiles
Description: Lists all files currently loaded in the application
Parameters: None
```

#### searchFiles
```
Name: searchFiles
Description: Searches for files by name or content
Parameters:
  - query (string, required): Search query string
```

## System Prompt Recommendations

Here's a suggested system prompt for your ElevenLabs agent:

```
You are Voice Code AI, an intelligent voice-controlled code editor assistant. You help developers edit code through natural voice commands.

CAPABILITIES:
- Insert, replace, and delete code in files
- Create new files
- Read file contents
- Search across files
- List all available files

GUIDELINES:
1. When you need to read a file that hasn't been loaded yet, use the readFile tool - it will automatically fetch it from GitHub
2. Always confirm which file you're editing before making changes
3. When making code changes, explain what you're doing
4. Use exact code matching for replace/delete operations
5. If a file path is not specified, operations apply to the currently open file
6. Be precise with line numbers and code snippets
7. Always validate that changes were successful

USER INTERACTION:
- Listen for natural voice commands like "add a function", "replace that var with let", "delete line 10"
- Ask for clarification if the user's intent is unclear
- Provide feedback on what actions you've taken
- Suggest improvements when appropriate

BEST PRACTICES:
- Keep code changes focused and atomic
- Maintain code style and formatting
- Explain potential issues or side effects
- Offer to read file contents before making changes if needed
```

## Testing Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Click the phone icon in the right panel to start a voice conversation

4. Load a GitHub repository using the file tree (left panel)

5. Try voice commands like:
   - "List all files"
   - "Read the src/App.tsx file" (will automatically fetch from GitHub)
   - "Create a new file called utils.ts"
   - "Replace console.log with console.error in the current file"
   - "Add a function at the end of index.ts"

## Troubleshooting

### Agent not connecting
- Verify your agent ID is correct in `.env.local`
- Check that your ElevenLabs account has active credits
- Ensure microphone permissions are granted in your browser

### Tools not working
- Verify all 7 client tools are configured in your ElevenLabs agent dashboard
- Check the browser console for error messages
- Open the event logs panel (bottom right button) to see tool execution logs

### readFile not working
- Ensure a GitHub repository has been loaded (use the file tree on the left panel)
- Verify you've entered a valid GitHub Personal Access Token
- Check that the file path is correct (e.g., "src/App.tsx" not "/src/App.tsx")
- Look at the event logs to see detailed error messages

### Changes not reflecting
- The readFile tool now automatically loads files and displays them
- Verify the file path matches exactly
- Check that edits are being applied to the correct file

## Architecture

The application uses:
- **FileStorageContext**: React context for managing file state
- **VoiceAgentTools**: Client-side tool implementations
- **VoiceAgentPanel**: UI component that registers tools with ElevenLabs
- **FileTree**: GitHub integration for loading files
- **FileViewer**: Real-time display of file contents and edits

All changes are stored client-side in React state and can be synchronized with the UI in real-time.
