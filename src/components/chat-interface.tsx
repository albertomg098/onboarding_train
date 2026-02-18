"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Shimmer } from "@/components/ai-elements/shimmer";

import {
  getFullSystemPrompt,
  getSuggestedPrompts,
  type ChatType,
} from "@/lib/prompt-store";
import { CHAT_PLACEHOLDERS } from "@/lib/constants";
import { archiveChat, getArchives, restoreArchive } from "@/lib/chat-archive";
import { ContextPanel } from "@/components/context-panel";
import { Copy, Trash2, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChatInterfaceProps {
  type: ChatType;
}

export function ChatInterface({ type }: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: {
            id,
            messages,
            type,
            systemPrompt: getFullSystemPrompt(type),
          },
        }),
      }),
    [type]
  );

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    id: `traza-chat-${type}`,
    transport,
  });

  // --- localStorage persistence ---

  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (
      (prev === "streaming" && (status === "ready" || status === "error")) &&
      messages.length > 0
    ) {
      localStorage.setItem(`traza-chat-${type}`, JSON.stringify(messages));
    }
    prevStatusRef.current = status;
  }, [status, messages, type]);

  useEffect(() => {
    const handleUnload = () => {
      if (messages.length > 0) {
        localStorage.setItem(`traza-chat-${type}`, JSON.stringify(messages));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [messages, type]);

  useEffect(() => {
    const saved = localStorage.getItem(`traza-chat-${type}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UIMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        localStorage.removeItem(`traza-chat-${type}`);
      }
    }
  }, [type, setMessages]);

  // --- Actions ---

  const handleClear = useCallback(() => {
    archiveChat(type, messages);
    setMessages([]);
    localStorage.removeItem(`traza-chat-${type}`);
  }, [type, messages, setMessages]);

  const handleCopy = useCallback(() => {
    const text = messages
      .map((m) => {
        const content =
          m.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("") ?? "";
        return `${m.role === "user" ? "You" : "AI"}: ${content}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
  }, [messages]);

  const handlePromptSubmit = useCallback(
    ({ text }: { text: string }) => {
      if (!text.trim() || status !== "ready") return;
      sendMessage({ text });
      setInput("");
    },
    [status, sendMessage]
  );

  const suggestedPrompts = getSuggestedPrompts(type);
  const archives = getArchives(type);
  const isStreaming = status === "streaming";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-1">
          {archives.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Archived Conversations
                </div>
                {archives.map((archive) => (
                  <DropdownMenuItem
                    key={archive.id}
                    onClick={() => {
                      const msgs = restoreArchive(type, archive.id);
                      if (msgs) {
                        setMessages(msgs);
                        localStorage.setItem(
                          `traza-chat-${type}`,
                          JSON.stringify(msgs)
                        );
                      }
                    }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-sm truncate w-full">
                      {archive.preview}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(archive.timestamp).toLocaleDateString()} ·{" "}
                      {archive.messageCount} msgs
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={messages.length === 0}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Panel */}
      <ContextPanel type={type} />

      {/* Chat area */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description={
                CHAT_PLACEHOLDERS[type] ?? "Type a message below to begin"
              }
            />
          ) : (
            <>
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    <MessageResponse>
                      {message.parts
                        ?.filter((p) => p.type === "text")
                        .map((p) => (p as { type: "text"; text: string }).text)
                        .join("") ?? ""}
                    </MessageResponse>
                  </MessageContent>
                </Message>
              ))}
              {isStreaming && <Shimmer>Thinking...</Shimmer>}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-t">
          {error.message || "An error occurred. Please try again."}
        </div>
      )}

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <Suggestions>
            {suggestedPrompts.map((prompt) => (
              <Suggestion
                key={prompt}
                suggestion={prompt}
                onClick={(s) => sendMessage({ text: s })}
              />
            ))}
          </Suggestions>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <PromptInput
          onSubmit={({ text }) => handlePromptSubmit({ text })}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                CHAT_PLACEHOLDERS[type] ?? "Type your message..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePromptSubmit({ text: input });
                }
              }}
            />
          </PromptInputBody>
          <PromptInputFooter>
            {isStreaming ? (
              <Button variant="outline" size="sm" type="button" onClick={() => stop()}>
                Stop
              </Button>
            ) : (
              <PromptInputSubmit disabled={!input.trim()} />
            )}
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
