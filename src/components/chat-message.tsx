import React from "react";
import type { UIMessage } from "ai";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text" }> =>
        part.type === "text"
    )
    .map((part) => part.text)
    .join("");
}

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const content = getTextContent(message);

  return (
    <div
      className={cn(
        "animate-message-in flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-primary/20" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary/10 border border-primary/20"
            : "bg-card border border-border"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div
            className={cn(
              isStreaming && content.length > 0 && "streaming-cursor"
            )}
          >
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
});
