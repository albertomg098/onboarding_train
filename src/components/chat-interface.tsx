"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { SuggestedPrompts } from "./suggested-prompts";
import {
  Send,
  Square,
  RotateCcw,
  AlertCircle,
  ArrowDown,
  Copy,
  Check,
} from "lucide-react";
import { CHAT_CONFIG, CHAT_PLACEHOLDERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  type: "domain" | "framework" | "simulation";
}

const TRANSPORTS: Record<string, DefaultChatTransport<UIMessage>> = {
  domain: new DefaultChatTransport({
    api: "/api/chat",
    body: { type: "domain" },
  }),
  framework: new DefaultChatTransport({
    api: "/api/chat",
    body: { type: "framework" },
  }),
  simulation: new DefaultChatTransport({
    api: "/api/chat",
    body: { type: "simulation" },
  }),
};

export function ChatInterface({ type }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate,
    setMessages,
    stop,
  } = useChat({
    id: type,
    transport: TRANSPORTS[type],
    experimental_throttle: 50,
    onError: (err) => {
      console.error(`[Chat Error - ${type}]`, err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  // localStorage persistence — save on status transition (streaming→ready)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasActive =
      prevStatusRef.current === "streaming" ||
      prevStatusRef.current === "submitted";
    const isNowReady = status === "ready";

    if (wasActive && isNowReady && messages.length > 0) {
      try {
        localStorage.setItem(
          `traza-chat-${type}`,
          JSON.stringify(messages)
        );
      } catch {
        /* localStorage full */
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, type]);

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`traza-chat-${type}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      /* corrupted */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Scroll management
  useEffect(() => {
    if (!isUserScrolledUp && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolledUp]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsUserScrolledUp(
      el.scrollHeight - el.scrollTop - el.clientHeight > 60
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsUserScrolledUp(false);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (
      !text ||
      text.length > CHAT_CONFIG.maxInputChars ||
      messages.length >= CHAT_CONFIG.maxMessages
    )
      return;
    sendMessage({ text });
    setInputValue("");
  }, [inputValue, sendMessage, messages.length]);

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      sendMessage({ text: prompt });
    },
    [sendMessage]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(`traza-chat-${type}`);
    } catch {}
    inputRef.current?.focus();
  }, [setMessages, type]);

  const handleCopy = useCallback(async () => {
    const text = messages
      .map((m) => {
        const content = m.parts
          .filter(
            (p): p is Extract<typeof p, { type: "text" }> =>
              p.type === "text"
          )
          .map((p) => p.text)
          .join("");
        return `${m.role === "user" ? "You" : "AI"}: ${content}`;
      })
      .join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [messages]);

  const charCount = inputValue.length;
  const isOverLimit = charCount > CHAT_CONFIG.maxInputChars;
  const isNearLimit =
    messages.length > CHAT_CONFIG.maxMessages - CHAT_CONFIG.warningThreshold;
  const isAtLimit = messages.length >= CHAT_CONFIG.maxMessages;

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          {messages.length > 0
            ? `${messages.length} message${messages.length !== 1 ? "s" : ""}`
            : "New conversation"}
        </span>
        {messages.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        ref={scrollContainerRef}
        data-scroll-area
      >
        {messages.length === 0 && !isLoading ? (
          <SuggestedPrompts type={type} onSelect={handleSuggestedPrompt} />
        ) : (
          messages.map((m, i) => (
            <ChatMessage
              key={m.id}
              message={m}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                m.role === "assistant"
              }
            />
          ))
        )}

        {status === "submitted" && (
          <div className="animate-message-in flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-muted mt-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm animate-message-in">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-destructive/90 flex-1">
              {error.message || "Something went wrong."}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerate()}
              className="text-xs flex-shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Conversation getting long ({messages.length}/
            {CHAT_CONFIG.maxMessages}).
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom FAB */}
      {isUserScrolledUp && messages.length > 0 && (
        <div className="flex justify-center -mt-12 mb-2 relative z-10 pointer-events-none">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full text-xs shadow-lg pointer-events-auto opacity-90 hover:opacity-100"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-3 w-3 mr-1" /> New messages
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border p-3 sm:p-4">
        <div
          className={cn(
            "flex gap-2 items-end rounded-xl bg-card border border-border p-1.5 transition-all duration-150 chat-input-wrapper"
          )}
        >
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CHAT_PLACEHOLDERS[type] ?? "Type your message..."}
            disabled={isLoading || isAtLimit}
            maxLength={CHAT_CONFIG.maxInputChars + 100}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm min-h-[40px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (
                  !isOverLimit &&
                  inputValue.trim() &&
                  !isAtLimit &&
                  !isLoading
                ) {
                  handleSend();
                }
              }
            }}
          />

          <div className="flex items-center gap-1 flex-shrink-0">
            {charCount > CHAT_CONFIG.maxInputChars * 0.8 && (
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {charCount}/{CHAT_CONFIG.maxInputChars}
              </span>
            )}

            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => stop()}
                className="h-8 w-8"
                title="Stop generating"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={!inputValue.trim() || isAtLimit || isOverLimit}
                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                title="Send message"
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isAtLimit && (
          <p className="text-xs text-destructive text-center mt-2">
            Conversation limit reached. Please clear and start a new
            conversation.
          </p>
        )}
      </div>
    </div>
  );
}
