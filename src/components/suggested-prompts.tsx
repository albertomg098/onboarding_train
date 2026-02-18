"use client";

import { Card } from "@/components/ui/card";
import { SUGGESTED_PROMPTS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

interface SuggestedPromptsProps {
  type: string;
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ type, onSelect }: SuggestedPromptsProps) {
  const prompts = SUGGESTED_PROMPTS[type] ?? [];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          Start a conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Choose a prompt below or type your own question
        </p>
      </div>
      <div className="grid gap-2.5 w-full max-w-md">
        {prompts.map((prompt) => (
          <Card
            key={prompt}
            role="button"
            tabIndex={0}
            className="p-3.5 cursor-pointer hover:bg-accent/10 hover:border-primary/30 transition-all duration-150 border-border group"
            onClick={() => onSelect(prompt)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(prompt);
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground/80">{prompt}</p>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
