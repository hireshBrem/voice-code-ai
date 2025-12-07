# Debugging the ElevenLabs Connection Error

## Current Issue

The ElevenLabs voice agent connects briefly but immediately disconnects with this error:
```
TypeError: Cannot read properties of undefined (reading 'error_type')
at BaseConversation.ts:317:41
```

## Root Cause Analysis

This error occurs in the ElevenLabs SDK's internal DataChannel error handling code. The error suggests that:

1. **The agent is trying to execute a tool call immediately upon connection**
2. **The tool is either not properly configured or returning an unexpected format**
3. **The SDK encounters a DataChannel error while processing the tool call**

## Step-by-Step Fix

### Step 1: Verify Tool Configuration in ElevenLabs Dashboard

Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai) → Select your agent → Client Tools

**CRITICAL**: Each tool must have **EXACT** parameter names and types:

#### insertCode
```
Name: insertCode
Type: Client-side tool
Parameters:
  - code (string, required)
  - position (string, optional)
  - filePath (string, optional)
```

#### replaceCode
```
Name: replaceCode
Type: Client-side tool
Parameters:
  - oldCode (string, required)
  - newCode (string, required)
  - filePath (string, optional)
```

#### deleteCode
```
Name: deleteCode
Type: Client-side tool
Parameters:
  - target (string, required)
  - filePath (string, optional)
```

#### createFile
```
Name: createFile
Type: Client-side tool
Parameters:
  - filename (string, required)
  - content (string, optional)
  - path (string, optional)
```

#### readFile
```
Name: readFile
Type: Client-side tool
Parameters:
  - filePath (string, required)
```

#### listFiles
```
Name: listFiles
Type: Client-side tool
Parameters: (none)
```

#### searchFiles
```
Name: searchFiles
Type: Client-side tool
Parameters:
  - query (string, required)
```

### Step 2: Update System Prompt

**CRITICAL**: Your agent's first message must be a simple greeting. It should NOT call any tools immediately.

Replace your current system prompt with:

```
You are Voice Code AI, an intelligent voice-controlled code editor assistant. You help developers edit code through natural voice commands.

IMPORTANT: When you first connect, simply greet the user. Do NOT call any tools until the user asks you to do something.

CAPABILITIES:
- Read files from GitHub repositories (automatically fetches if not cached)
- Insert, replace, and delete code in files
- Create new files
- Search across files
- List all available files

WORKFLOW:
1. When user asks to edit a file, FIRST use readFile to load it
2. Confirm you understand the changes needed
3. Then use the appropriate tool (insertCode, replaceCode, deleteCode)
4. Confirm the changes were successful

GUIDELINES:
1. **ALWAYS** use readFile before making changes to a file
2. readFile will automatically fetch from GitHub if the file isn't loaded yet
3. Always confirm which file you're editing before making changes
4. Use exact code matching for replace/delete operations (whitespace matters!)
5. If a file path is not specified, operations apply to the currently open file
6. Provide clear feedback on what actions you've taken

USER INTERACTION:
- Listen for natural voice commands like:
  - "read the App.tsx file"
  - "add a function at the end"
  - "replace that console.log with console.error"
  - "delete line 10"
- Ask for clarification if the user's intent is unclear
- Explain what you're doing as you make changes

BEST PRACTICES:
- Keep code changes focused and atomic
- Maintain code style and formatting
- Explain potential issues or side effects
- Read files before editing them (use readFile)
```

### Step 3: Configure First Message

In your ElevenLabs agent settings:

**First Message:** `Hello! I'm Voice Code AI. I can help you edit code with voice commands. What would you like to work on?`

**IMPORTANT**: This should be plain text, NOT a tool call.

### Step 4: Test the Connection

1. Clear browser cache and reload the page
2. Load a GitHub repository using the file tree (left panel)
3. Click the phone icon to connect
4. Wait for the greeting message
5. Try: "List all files"
6. Try: "Read the src/App.tsx file"
7. Try: "Add a comment at the end saying 'test comment'"

### Step 5: Check Event Logs

Click the "Event Logs" button (bottom right) to see:
- Tool calls being made
- Files being loaded
- Any errors that occur

## Common Issues

### Issue: "No GitHub token or repository selected"
**Solution**: Load a repository using the file tree before using voice commands

### Issue: "File not found"
**Solution**: Check that:
1. The file path is correct (e.g., "src/App.tsx" not "/src/App.tsx")
2. The repository is loaded in the file tree
3. You have a valid GitHub token entered

### Issue: "Code not found in file"
**Solution**: The exact code string must match, including whitespace. Ask the agent to read the file first to see the exact format.

### Issue: Connection drops immediately
**Solution**:
1. Verify all 7 tools are configured with correct parameter names
2. Check that the system prompt doesn't call tools immediately
3. Ensure first message is a simple greeting

## Technical Details

### Architecture
- **FileStorageContext**: Manages all file state in React
- **VoiceAgentTools**: Client-side tool implementations
- **GitHub API**: Fetches files on-demand via readFile tool
- **ElevenLabs SDK**: Handles WebRTC connection and tool calls

### Data Flow
1. User clicks file in FileTree → Fetches from GitHub → Stores in context
2. Voice agent calls readFile → Checks context → Fetches from GitHub if needed → Stores in context
3. Voice agent calls insertCode/replaceCode/deleteCode → Updates context → FileViewer displays changes
4. All changes stay in client state (not saved to GitHub)

## Emergency Debugging

If the error persists, check browser console for:
1. Network errors (GitHub API failures)
2. Tool execution errors
3. ElevenLabs SDK warnings

Run in browser console:
```javascript
// Check if agent ID is set
console.log(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID)

// Check FileStorage state
window.__REACT_DEVTOOLS_GLOBAL_HOOK__
```

## Next Steps

If the error still occurs after following all steps:

1. **Take a screenshot** of your ElevenLabs tool configuration
2. **Copy your system prompt** from the dashboard
3. **Share the event logs** from the UI
4. **Check browser console** for additional error details

This will help identify if the issue is:
- Tool configuration mismatch
- System prompt calling tools too early
- SDK version compatibility
- Network/API issues
