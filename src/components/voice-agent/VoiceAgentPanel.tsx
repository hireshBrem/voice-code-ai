"use client"

import { useCallback, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Orb } from "@/components/ui/orb"
import { ShimmeringText } from "@/components/ui/shimmering-text"

const DEFAULT_AGENT = {
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
    name: "Voice Code AI",
    description: "Tap to start voice coding",
}

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null

type LogEntry = {
  timestamp: string
  type: "info" | "error" | "message"
  text: string
}

export function VoiceAgentPanel({ fileTree, selectedRepo, token }: { fileTree: any[], selectedRepo: any, token: string }) {
  const [agentState, setAgentState] = useState<AgentState>("disconnected")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback(
    (text: string, type: "info" | "error" | "message" = "info") => {
      const timestamp = new Date().toLocaleTimeString()
      setLogs((prev) => [...prev, { timestamp, type, text }])
    },
    []
  )

    const debug = async () => {

    }

  const conversation = useConversation({
    onConnect: () => {
      const msg = "Connected"
      console.log(msg)
      addLog(msg)
    },
    onDisconnect: () => {
      const msg = "Disconnected"
      console.log(msg)
      addLog(msg)
    },
    onMessage: (message) => {
      const msg = `Message: ${JSON.stringify(message)}`
      console.log(msg)
      addLog(msg, "message")
    },
    onError: (error) => {
      const msg = `Error: ${error}`
      console.error(msg)
      addLog(msg, "error")
      setAgentState("disconnected")
    },
    clientTools: {
      updateCode: async (parameters: { code: string; filePath?: string }) => {
        addLog(`Tool called: updateCode`, "info")
        // TODO: Implement with file storage context
        // const result = voiceTools.updateCode(parameters)
        // addLog(`Result: ${result.message}`, result.success ? "info" : "error")
        // return result.success ? result.message : `Error: ${result.message}`
        return "updateCode not implemented"
      },
      createFile: async (parameters: { fileName: string; content: string; filePath?: string }) => {
        addLog(`Tool called: createFile`, "info")
        // TODO: Implement with file storage context
        // const result = voiceTools.createFile(parameters)
        // addLog(`Result: ${result.message}`, result.success ? "info" : "error")
        // return result.success ? result.message : `Error: ${result.message}`
        return "createFile not implemented"
      },
      listFiles: async () => {
        addLog(`Tool called: listFiles`, "info")

        if (!fileTree || fileTree.length === 0) {
          const msg = "No files loaded. Please select a repository first."
          addLog(msg, "error")
          return msg
        }

        const paths = fileTree.map(item => item.path)
        const repoInfo = selectedRepo ? `${selectedRepo.owner.login}/${selectedRepo.name}` : 'Unknown'

        const result = {
          repository: repoInfo,
          totalItems: fileTree.length,
          tree: paths,
        }

        addLog(`Loaded ${result.totalItems} items`, "info")
        return JSON.stringify(result, null, 2)
      }
    },
    
  })

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null)
      addLog("Requesting microphone access...")
      await navigator.mediaDevices.getUserMedia({ audio: true })
      addLog("Microphone access granted, starting session...")
      await conversation.startSession({
        agentId: DEFAULT_AGENT.agentId,
        connectionType: "webrtc",
        onStatusChange: (status) => setAgentState(status.status),
        dynamicVariables: {
            owner: selectedRepo.owner.login,
            repo: selectedRepo.name
        },
      })
    } catch (error) {
      const errMsg = `Error starting conversation: ${error}`
      console.error(errMsg)
      addLog(errMsg, "error")
      setAgentState("disconnected")
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions in your browser.")
        addLog("Microphone permission denied", "error")
      }
    }
  }, [conversation, addLog])

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting")
      startConversation()
    } else if (agentState === "connected") {
      conversation.endSession()
      setAgentState("disconnected")
    }
  }, [agentState, conversation, startConversation])

  const isCallActive = agentState === "connected"
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting"

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  return (
    <div className="relative h-screen w-full overflow-hidden">
        <button onClick={debug}>Debug</button>
      <Card className="flex h-full w-full flex-col items-center justify-center overflow-hidden p-6">
        <div className="flex flex-col items-center gap-6">
        <div className="relative size-32">
          <div className="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
              <Orb
                className="h-full w-full"
                volumeMode="manual"
                getInputVolume={getInputVolume}
                getOutputVolume={getOutputVolume}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold">{DEFAULT_AGENT.name}</h2>
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-destructive text-center text-sm"
              >
                {errorMessage}
              </motion.p>
            ) : agentState === "disconnected" || agentState === null ? (
              <motion.p
                key="disconnected"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-muted-foreground text-sm"
              >
                {DEFAULT_AGENT.description}
              </motion.p>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    agentState === "connected" && "bg-green-500",
                    isTransitioning && "bg-primary/60 animate-pulse"
                  )}
                />
                <span className="text-sm capitalize">
                  {isTransitioning ? (
                    <ShimmeringText text={agentState} />
                  ) : (
                    <span className="text-green-600">Connected</span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleCall}
          disabled={isTransitioning}
          size="icon"
          variant={isCallActive ? "secondary" : "default"}
          className="h-12 w-12 rounded-full"
        >
          <AnimatePresence mode="wait">
            {isTransitioning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                }}
              >
                <Loader2Icon className="h-5 w-5" />
              </motion.div>
            ) : isCallActive ? (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <PhoneOffIcon className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <PhoneIcon className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="absolute bottom-6 right-6 rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-secondary/90 transition-colors"
          title="Toggle logs"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </Card>

      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 h-1/3 bg-white border-t border-zinc-200 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h3 className="font-semibold text-zinc-900">Event Logs</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-zinc-500 hover:text-zinc-900"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-mono">
              {logs.length === 0 ? (
                <p className="text-zinc-400">No logs yet...</p>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-xs",
                      log.type === "error"
                        ? "text-red-600"
                        : log.type === "message"
                          ? "text-blue-600"
                          : "text-green-600"
                    )}
                  >
                    <span className="text-zinc-400">[{log.timestamp}]</span>{" "}
                    {log.text}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
