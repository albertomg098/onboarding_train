"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getCachedDomainData } from "@/lib/prompt-store";
import type { DomainTheoryData } from "@/lib/types";

const STEPS = [
  {
    step: 1,
    name: "UNDERSTAND",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    lenses: [
      "Domain First — what does the business actually do?",
      "Happy Path — what's the ideal flow?",
      "Edge Cases — what breaks? What's rare but costly?",
      "Numbers — how many? How often? How long?",
    ],
    questions: [
      "What does a typical day look like for the user?",
      "What's the most painful part of this process?",
      "What happens when something goes wrong?",
      "What's the volume? 10/day or 10,000/day?",
    ],
    mistake:
      "Jumping to design without understanding the problem. The #1 reason candidates fail.",
  },
  {
    step: 2,
    name: "MODEL",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    lenses: [
      "Entities — what are the 'things' in this domain?",
      "States — what stages does each entity go through?",
      "Relationships — how do entities connect?",
      "Triggers — what causes state transitions?",
    ],
    questions: [
      "What are the core objects in this system?",
      "What lifecycle does each go through?",
      "Which entities depend on each other?",
      "What events cause changes?",
    ],
    mistake:
      "Modeling too abstractly. Use concrete domain language, not generic tech terms.",
  },
  {
    step: 3,
    name: "PRIORITIZE",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    lenses: [
      "Impact vs Effort — classic 2x2 matrix",
      "Quick Wins — what's high impact + low effort?",
      "Hard Problems — what's high impact but needs investment?",
      "Not Worth It — what's low impact regardless of effort?",
    ],
    questions: [
      "Which problem, if solved, unlocks the most value?",
      "What can we automate in week 1?",
      "What needs 3 months of iteration?",
      "What should we explicitly NOT build?",
    ],
    mistake:
      "Trying to solve everything at once. Pick the 20% that delivers 80% of value.",
  },
  {
    step: 4,
    name: "DESIGN",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    lenses: [
      "Trigger — what starts the AI Worker?",
      "Steps — what does it do, in order?",
      "Decisions — where does it need to make choices?",
      "Escalation — when does it hand off to a human?",
    ],
    questions: [
      "What event triggers this workflow?",
      "What's the step-by-step process?",
      "Where does the AI need judgment?",
      "What's the confidence threshold for human handoff?",
    ],
    mistake:
      "Designing for 100% automation. Good AI Workers know when to escalate.",
  },
  {
    step: 5,
    name: "BUSINESS IMPACT",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    lenses: [
      "Time Saved — hours/week freed up?",
      "Error Reduction — what mistakes are eliminated?",
      "Cost Savings — direct $ saved?",
      "Scalability — can the team handle 10x volume?",
    ],
    questions: [
      "How many hours/week does this save?",
      "What's the error rate today vs. with automation?",
      "What's the cost of a mistake in this process?",
      "Can this scale without adding headcount?",
    ],
    mistake:
      "Forgetting to quantify. 'It'll save time' is not a business case. '40 hours/week at $50/hr = $104K/year' is.",
  },
];

export function FrameworkTheory() {
  const [domainData, setDomainData] = useState<DomainTheoryData | null>(null);

  useEffect(() => {
    setDomainData(getCachedDomainData());
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <Card className="p-4 bg-card border-border">
        <p className="text-sm text-foreground/80 leading-relaxed">
          This 5-step framework is how Traza approaches every client problem. It
          ensures you don&apos;t jump to solutions before understanding the
          problem, and that every design decision is grounded in domain reality
          and business value.
        </p>
      </Card>

      {domainData && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">
            Domain: {domainData.domainName}
          </p>
          <p className="text-xs text-muted-foreground">
            Vocabulary: {domainData.vocabulary.map((v) => v.term).join(", ")}
          </p>
          <p className="text-xs text-muted-foreground">
            Workflow: {domainData.lifecycle.map((l) => l.name).join(" → ")}
          </p>
        </Card>
      )}

      {STEPS.map((s) => (
        <Card key={s.step} className={`p-4 border ${s.borderColor} bg-card`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`${s.bgColor} ${s.color} border-0 font-bold`}>
              Step {s.step}
            </Badge>
            <h3 className={`text-lg font-bold ${s.color}`}>{s.name}</h3>
          </div>

          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="lenses" className="border-border">
              <AccordionTrigger className="text-sm font-medium">
                Key Lenses
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {s.lenses.map((l, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/80 flex items-start gap-2"
                    >
                      <span className={`${s.color} mt-0.5`}>&#9656;</span> {l}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="questions" className="border-border">
              <AccordionTrigger className="text-sm font-medium">
                Key Questions to Ask
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {s.questions.map((q, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-muted-foreground mt-0.5">?</span>{" "}
                      {q}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-3 p-2 rounded bg-destructive/5 border border-destructive/10">
            <p className="text-xs text-destructive/80">
              Common mistake: {s.mistake}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
