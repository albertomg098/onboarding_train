"use client";

import { useState, useEffect } from "react";
import { DEFAULT_DOMAIN } from "@/lib/default-domain-data";
import { TheoryRenderer } from "@/components/theory-renderer";
import { setSystemPrompt, resetSystemPrompt } from "@/lib/prompt-store";
import type { DomainTheoryData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const CACHE_KEY = "traza-custom-domain";

export function DomainTheory() {
  const [domainData, setDomainData] = useState<DomainTheoryData>(DEFAULT_DOMAIN);
  const [customDomain, setCustomDomain] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setDomainData(JSON.parse(cached));
      } catch {
        /* use default */
      }
    }
  }, []);

  const handleGenerate = async () => {
    const trimmed = customDomain.trim();
    if (!trimmed) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-theory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Generation failed" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data: DomainTheoryData = await res.json();
      setDomainData(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));

      setSystemPrompt(
        "domain",
        `You are a senior industry expert in ${data.domainName}.
Your role: Teach ${data.domainName} concepts clearly to someone preparing for a role in this industry.
Key vocabulary: ${data.vocabulary.map((v) => v.term).join(", ")}.
Workflow steps: ${data.lifecycle.map((l) => l.name).join(" → ")}.
AI areas: ${data.aiUseCases.map((a) => a.area).join(", ")}.
Be specific, use real examples, connect to practical scenarios.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setDomainData(DEFAULT_DOMAIN);
    localStorage.removeItem(CACHE_KEY);
    setCustomDomain("");
    resetSystemPrompt("domain");
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Default: Freight Forwarding. Generate content for any domain.
        </p>
        <div className="flex gap-2">
          <Input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="e.g., Healthcare Logistics, E-commerce Fulfillment..."
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerate();
            }}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !customDomain.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
          {domainData.domainName !== "Freight Forwarding" && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        {isGenerating && (
          <p className="text-sm text-muted-foreground mt-2">
            Generating content (15-30 seconds)...
          </p>
        )}
      </Card>

      <TheoryRenderer data={domainData} />
    </div>
  );
}
