"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PromptEditor } from "@/components/prompt-editor";

type KeyStatus = "idle" | "testing" | "valid" | "invalid";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<KeyStatus>("idle");
  const [saving, setSaving] = useState(false);

  const handleTest = useCallback(async () => {
    setStatus("testing");
    try {
      const res = await fetch("/api/settings/api-key");
      const data = await res.json();
      setStatus(data.valid ? "valid" : "invalid");
    } catch {
      setStatus("invalid");
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/settings/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      setApiKey("");
      await handleTest();
    } catch {
      setStatus("invalid");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    handleTest();
  }, [handleTest]);

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Enter your own Anthropic API key, or leave empty to use the default
            server key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <Button
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "valid"
                  ? "bg-green-500"
                  : status === "invalid"
                    ? "bg-red-500"
                    : status === "testing"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-muted-foreground"
              }`}
            />
            <span>
              {status === "valid" && "API key is working"}
              {status === "invalid" && "API key is invalid or missing"}
              {status === "testing" && "Testing..."}
              {status === "idle" && "Not tested"}
            </span>
          </div>
        </CardContent>
      </Card>

      <PromptEditor />
    </div>
    </div>
  );
}
