"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getSystemPrompt,
  setSystemPrompt,
  resetSystemPrompt,
  isPromptCustomized,
  getContext,
  setContext,
  resetContext,
  getSuggestedPrompts,
  setSuggestedPrompts,
  resetSuggestedPrompts,
  getFullSystemPrompt,
  exportAllPrompts,
  importAllPrompts,
  type ChatType,
} from "@/lib/prompt-store";
import { Download, Upload, RotateCcw, Save, Eye } from "lucide-react";

const CHAT_TYPES: { id: ChatType; label: string }[] = [
  { id: "domain", label: "Domain Knowledge" },
  { id: "framework", label: "Mental Framework" },
  { id: "simulation", label: "Scenario Simulation" },
];

export function PromptEditor() {
  const [activeTab, setActiveTab] = useState<ChatType>("domain");
  const [promptText, setPromptText] = useState("");
  const [contextText, setContextText] = useState("");
  const [suggestedText, setSuggestedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setPromptText(getSystemPrompt(activeTab));
    setContextText(getContext(activeTab));
    setSuggestedText(JSON.stringify(getSuggestedPrompts(activeTab), null, 2));
    setSaveMessage("");
    setShowPreview(false);
  }, [activeTab]);

  const flash = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const handleSavePrompt = () => {
    if (!promptText.trim()) {
      flash("Cannot save empty prompt");
      return;
    }
    setSystemPrompt(activeTab, promptText);
    flash("System prompt saved!");
  };

  const handleSaveContext = () => {
    setContext(activeTab, contextText);
    flash("Context saved!");
  };

  const handleSaveSuggested = () => {
    try {
      const parsed = JSON.parse(suggestedText);
      if (!Array.isArray(parsed) || !parsed.every((s) => typeof s === "string")) {
        flash("Error: must be a JSON array of strings");
        return;
      }
      setSuggestedPrompts(activeTab, parsed);
      flash("Suggested prompts saved!");
    } catch {
      flash("Error: invalid JSON");
    }
  };

  const handleReset = () => {
    resetSystemPrompt(activeTab);
    resetContext(activeTab);
    resetSuggestedPrompts(activeTab);
    setPromptText(getSystemPrompt(activeTab));
    setContextText(getContext(activeTab));
    setSuggestedText(JSON.stringify(getSuggestedPrompts(activeTab), null, 2));
    flash("Reset to defaults!");
  };

  const handleExport = () => {
    const json = exportAllPrompts();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traza-prompts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = importAllPrompts(text);
      if (result.success) {
        setPromptText(getSystemPrompt(activeTab));
        setContextText(getContext(activeTab));
        setSuggestedText(JSON.stringify(getSuggestedPrompts(activeTab), null, 2));
        flash("Imported successfully!");
      } else {
        flash(`Import failed: ${result.error}`);
      }
    };
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ChatType)}
        >
          <TabsList className="mb-4">
            {CHAT_TYPES.map((ct) => (
              <TabsTrigger
                key={ct.id}
                value={ct.id}
                className="flex items-center gap-2"
              >
                {ct.label}
                {isPromptCustomized(ct.id) && (
                  <Badge variant="secondary" className="text-xs">
                    Custom
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {CHAT_TYPES.map((ct) => (
            <TabsContent key={ct.id} value={ct.id} className="space-y-4">
              {/* System Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">System Prompt</label>
                  <span className="text-xs text-muted-foreground">
                    {promptText.length} / 10,000
                  </span>
                </div>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  maxLength={10000}
                />
                <Button size="sm" onClick={handleSavePrompt}>
                  <Save className="h-3 w-3 mr-1" /> Save Prompt
                </Button>
              </div>

              {/* User Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">User Context</label>
                  <span className="text-xs text-muted-foreground">
                    Prepended to system prompt · {contextText.length} / 2,000
                  </span>
                </div>
                <Textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  rows={4}
                  placeholder="e.g., I'm preparing for a Traza interview focusing on ocean freight..."
                  maxLength={2000}
                />
                <Button size="sm" onClick={handleSaveContext}>
                  <Save className="h-3 w-3 mr-1" /> Save Context
                </Button>
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Suggested Prompts (JSON array)
                </label>
                <Textarea
                  value={suggestedText}
                  onChange={(e) => setSuggestedText(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <Button size="sm" onClick={handleSaveSuggested}>
                  <Save className="h-3 w-3 mr-1" /> Save Suggested
                </Button>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showPreview ? "Hide" : "Preview"} Full Prompt
                </Button>
                {showPreview && (
                  <div className="p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {getFullSystemPrompt(activeTab)}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport}>
              <Upload className="h-3 w-3 mr-1" /> Import
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-sm text-green-600">{saveMessage}</span>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset Tab
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This resets the system prompt, context, and suggested prompts
                    for this tab to their original values. Cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
