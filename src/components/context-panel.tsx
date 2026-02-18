"use client";

import { useState, useEffect } from "react";
import { getContext, setContext, type ChatType } from "@/lib/prompt-store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, StickyNote } from "lucide-react";

interface ContextPanelProps {
  type: ChatType;
}

export function ContextPanel({ type }: ContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(getContext(type));
  }, [type]);

  const handleSave = () => {
    setContext(type, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <StickyNote className="h-3 w-3" />
        <span>
          Context
          {value.trim() && (
            <span className="ml-1 text-primary">· Active</span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-auto" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add context for the AI (e.g., 'I'm preparing for an interview at Traza')..."
            rows={3}
            className="text-sm"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {value.length}/2000
            </span>
            <Button size="sm" variant="outline" onClick={handleSave}>
              {saved ? "Saved!" : "Save Context"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
