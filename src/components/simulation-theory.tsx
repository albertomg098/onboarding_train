"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RUBRIC = [
  {
    step: "UNDERSTAND",
    weight: "30%",
    description: "Did you ask probing questions? Did you cover all 4 lenses?",
    good: "Asked about volumes, error rates, current tools, pain points",
    bad: "Jumped straight to 'I would build an AI that...'",
  },
  {
    step: "MODEL",
    weight: "15%",
    description: "Did you identify entities, states, and relationships?",
    good: "Drew out the shipment lifecycle with clear states",
    bad: "Used vague terms like 'the system processes things'",
  },
  {
    step: "PRIORITIZE",
    weight: "15%",
    description:
      "Did you identify the highest-impact automation opportunity?",
    good: "Identified the 80/20 and justified the choice with data",
    bad: "Tried to automate everything at once",
  },
  {
    step: "DESIGN",
    weight: "25%",
    description: "Is the AI Worker design concrete and actionable?",
    good: "Clear trigger, steps, decision points, and escalation rules",
    bad: "Hand-wavy 'the AI would figure it out'",
  },
  {
    step: "BUSINESS IMPACT",
    weight: "15%",
    description: "Did you quantify the value?",
    good: "'Saves 40 hrs/week x $50/hr = $104K/year, reduces errors by 90%'",
    bad: "'It would be faster and more efficient'",
  },
];

const TIPS = [
  {
    title: "Ask before you build",
    content:
      "Spend 40-50% of your time in UNDERSTAND. The best candidates ask 10+ questions before designing anything.",
  },
  {
    title: "Use the client's language",
    content:
      "Say 'Bill of Lading' not 'document'. Say 'demurrage charges' not 'penalties'. Domain fluency matters.",
  },
  {
    title: "Quantify everything",
    content:
      "Every claim should have a number. 'Saves time' is bad. '2 hours/shipment x 200 shipments/month = 400 hours/month' is good.",
  },
  {
    title: "Know when to escalate",
    content:
      "Good AI Workers have clear human handoff points. 'If confidence < 85%, route to ops team' shows maturity.",
  },
  {
    title: "Think in workflows, not features",
    content:
      "Don't say 'build a dashboard.' Say 'when an exception email arrives, the AI Worker: classifies it, extracts data, checks against booking, notifies ops team with context.'",
  },
];

export function SimulationTheory() {
  return (
    <div className="max-w-4xl space-y-8">
      <Card className="p-4 bg-card border-border">
        <p className="text-sm text-foreground/80 leading-relaxed">
          The simulation mimics a real Traza work trial. You&apos;ll be
          presented with a client scenario and expected to work through the
          5-step framework. The AI plays the role of a Traza team member — ask
          it questions as if you&apos;re in a real interview.
        </p>
      </Card>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Scoring Rubric
        </h2>
        <div className="space-y-3">
          {RUBRIC.map((r, i) => (
            <Card key={i} className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {r.step}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {r.weight}
                </Badge>
              </div>
              <p className="text-sm text-foreground/80 mb-2">
                {r.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-green-500/5 border border-green-500/10">
                  <span className="text-green-400 font-medium">Good:</span>
                  <span className="text-foreground/70 ml-1">{r.good}</span>
                </div>
                <div className="p-2 rounded bg-red-500/5 border border-red-500/10">
                  <span className="text-red-400 font-medium">Bad:</span>
                  <span className="text-foreground/70 ml-1">{r.bad}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Pro Tips
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((tip, i) => (
            <Card key={i} className="p-4 bg-card border-border">
              <h3 className="text-sm font-semibold text-primary mb-1">
                {tip.title}
              </h3>
              <p className="text-xs text-foreground/80">{tip.content}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
