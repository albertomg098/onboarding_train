"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// ── Data constants (outside component — prevents re-creation on render) ──

type FitScore = "Low" | "Medium" | "High" | "Very High";

interface PricingModel {
  name: string;
  howItWorks: string;
  examples: string;
  pros: string[];
  cons: string[];
  trazaFit: FitScore;
  trazaFitReason: string;
}

const PRICING_MODELS: PricingModel[] = [
  {
    name: "Per-Seat / Per-User License",
    howItWorks: "Fixed monthly fee per user who accesses the AI system.",
    examples: "Salesforce ($25-300/user/mo), HubSpot, traditional SaaS",
    pros: ["Predictable revenue", "Simple to understand", "Familiar to buyers"],
    cons: [
      "Penalizes adoption — more users = more cost",
      "Doesn't reflect value delivered",
      "Users find workarounds (shared logins)",
    ],
    trazaFit: "Low",
    trazaFitReason:
      "AI Workers replace human work; charging per-human contradicts the value prop.",
  },
  {
    name: "Per-AI-Worker / Per-Agent",
    howItWorks: "Fixed fee per AI Worker deployed (e.g., €500/mo per Worker).",
    examples: "Some early AI agent startups",
    pros: ["Easy to quote", "Scales with solution complexity"],
    cons: [
      "Doesn't reflect usage volume",
      "Client hesitates to add Workers",
      "Unclear what one Worker means",
    ],
    trazaFit: "Medium",
    trazaFitReason: "Intuitive but disconnects price from value delivered.",
  },
  {
    name: "Per-Operation / Per-Transaction",
    howItWorks:
      "Client pays per unit of work completed (per shipment, per document, per email).",
    examples:
      "Stripe (2.9%/txn), Twilio (per message), AWS Lambda (per invocation)",
    pros: [
      "Perfect value alignment",
      "Scales naturally with client growth",
      "Easy ROI calculation",
      "Low barrier to entry",
    ],
    cons: [
      "Revenue volatility",
      "Client may worry about unpredictable costs",
      "Requires metering infrastructure",
    ],
    trazaFit: "Very High",
    trazaFitReason:
      "Maps directly to shipments processed or documents handled.",
  },
  {
    name: "Outcome-Based / Value-Based",
    howItWorks:
      "Price tied to measurable business outcomes (% of cost saved, % of revenue generated).",
    examples:
      "Consulting firms, performance marketing (CPA), debt collection agencies",
    pros: [
      "Maximum alignment",
      "Easy sell: you only pay when we deliver",
      "Strong retention",
    ],
    cons: [
      "Hard to attribute outcomes",
      "Requires baseline measurement",
      "Disputes over causality",
    ],
    trazaFit: "Medium",
    trazaFitReason:
      "Compelling for demurrage reduction (measurable) but hard for time saved.",
  },
  {
    name: "Platform Fee + Usage",
    howItWorks:
      "Base monthly fee for platform access + variable cost per operation.",
    examples:
      "Shopify (subscription + txn %), AWS (account + pay-per-use), Datadog",
    pros: [
      "Predictable base + upside",
      "Covers infrastructure costs",
      "Balanced risk for both sides",
    ],
    cons: ["More complex pricing page", "Two variables to negotiate"],
    trazaFit: "Very High",
    trazaFitReason:
      "Base covers deployment/maintenance, usage captures value scaling.",
  },
  {
    name: "Tiered Bundles",
    howItWorks:
      "Good / Better / Best packages with increasing features or volume.",
    examples: "Slack (Free/Pro/Business+), Notion, most SaaS",
    pros: [
      "Anchoring effect",
      "Self-selection by client size",
      "Clear upgrade path",
    ],
    cons: [
      "Arbitrary tiers frustrate edge cases",
      "Feature gating feels artificial for AI",
    ],
    trazaFit: "Medium",
    trazaFitReason:
      "Works for segmentation but tiers feel forced when value is per-operation.",
  },
  {
    name: "Consumption Credits",
    howItWorks:
      "Client pre-purchases credits; each operation costs X credits.",
    examples: "OpenAI API, Snowflake, Twilio",
    pros: [
      "Prepaid revenue",
      "Flexible across operation types",
      "Simple metering",
    ],
    cons: [
      "Credit anxiety — clients hesitate to use",
      "Requires credit-to-operation mapping",
    ],
    trazaFit: "Medium",
    trazaFitReason:
      "Adds unnecessary abstraction for most freight forwarding clients.",
  },
  {
    name: "Revenue Share / Margin Share",
    howItWorks:
      "Traza takes a percentage of value created or margin improvement.",
    examples: "Amazon Marketplace (15%), App Store (30%), affiliates",
    pros: ["Unlimited upside if you deliver", "Ultra-aligned incentives"],
    cons: [
      "Requires transparency into client finances",
      "Trust issues",
      "Hard to verify",
    ],
    trazaFit: "Low",
    trazaFitReason:
      "Freight forwarders are notoriously opaque about margins; impractical.",
  },
];

const FIT_COLORS: Record<FitScore, string> = {
  Low: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  High: "bg-green-500/10 text-green-400 border-green-500/20",
  "Very High": "bg-primary/10 text-primary border-primary/20",
};

interface Competitor {
  company: string;
  model: string;
  pricing: string;
  target: string;
}

const COMPETITORS: Competitor[] = [
  { company: "Salesforce Einstein", model: "Per-seat + platform", pricing: "$50-300/user/mo", target: "Enterprise CRM" },
  { company: "UiPath", model: "Per-bot license", pricing: "$420/bot/mo", target: "RPA" },
  { company: "Automation Anywhere", model: "Per-bot + consumption", pricing: "~$750/bot/mo", target: "RPA Enterprise" },
  { company: "Relevance AI", model: "Per-agent + operations", pricing: "$19-599/mo tiered", target: "AI Agent builders" },
  { company: "Artisan AI", model: "Per-agent flat fee", pricing: "~$2,000/mo per AI employee", target: "AI SDRs" },
  { company: "Lindy AI", model: "Tiered + credits", pricing: "$49-499/mo", target: "AI assistants" },
  { company: "11x.ai", model: "Per-AI-worker", pricing: "~$5,000/mo per AI SDR", target: "AI sales reps" },
];

interface OperationPricing {
  operation: string;
  priceRange: string;
  unit: string;
}

const OPERATION_PRICING: OperationPricing[] = [
  { operation: "Document extraction & validation", priceRange: "€0.50 - €2.00", unit: "per document" },
  { operation: "Email classification + routing", priceRange: "€0.10 - €0.30", unit: "per email" },
  { operation: "Shipment status update", priceRange: "€0.05 - €0.15", unit: "per update" },
  { operation: "Quote generation", priceRange: "€2.00 - €5.00", unit: "per quote" },
  { operation: "Exception detection + alert", priceRange: "€0.50 - €1.50", unit: "per exception" },
  { operation: "Full shipment lifecycle", priceRange: "€3.00 - €8.00", unit: "per shipment" },
];

// ── Component ───────────────────────────────────────────────────────────

export function PricingTheory() {
  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Section 1: Hero Card ─────────────────────────────── */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">
            Why Pricing Is the Hardest Problem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/80">
          <p>
            AI Worker products break traditional SaaS pricing. You&apos;re not
            selling seats or features — you&apos;re selling{" "}
            <span className="text-primary font-medium">work done</span>. This
            fundamentally changes how value is measured and captured.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-card rounded-lg p-3 border border-border text-center">
              <div className="text-2xl font-bold text-primary">82%</div>
              <div className="text-xs text-muted-foreground">Target gross margin</div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border text-center">
              <div className="text-2xl font-bold text-primary">3-4x</div>
              <div className="text-xs text-muted-foreground">Client ROI target</div>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border text-center">
              <div className="text-2xl font-bold text-primary">3 layers</div>
              <div className="text-xs text-muted-foreground">Recommended model</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: 8 Pricing Models ──────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          8 Pricing Models for AI Workers
        </h2>
        <Accordion type="multiple" className="space-y-2">
          {PRICING_MODELS.map((model, i) => (
            <AccordionItem
              key={i}
              value={`model-${i}`}
              className="bg-card border border-border rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs w-5">
                    {i + 1}.
                  </span>
                  <span>{model.name}</span>
                  <Badge
                    variant="outline"
                    className={`ml-auto text-[10px] ${FIT_COLORS[model.trazaFit]}`}
                  >
                    Traza Fit: {model.trazaFit}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-3 pb-4">
                <p className="text-foreground/80">{model.howItWorks}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/60">
                    Examples:
                  </span>{" "}
                  {model.examples}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-1">
                      Pros
                    </p>
                    <ul className="text-xs text-foreground/70 space-y-1">
                      {model.pros.map((p, j) => (
                        <li key={j}>+ {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1">
                      Cons
                    </p>
                    <ul className="text-xs text-foreground/70 space-y-1">
                      {model.cons.map((c, j) => (
                        <li key={j}>− {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-primary/5 rounded p-2 text-xs">
                  <span className="font-medium text-primary">
                    Traza Assessment:
                  </span>{" "}
                  {model.trazaFitReason}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ── Section 3: Competitor Table ──────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Competitor Pricing Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Company</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Model</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Pricing</th>
                  <th className="py-2 text-xs font-medium text-muted-foreground">Target</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium text-foreground/90">{c.company}</td>
                    <td className="py-2 pr-4 text-foreground/70">{c.model}</td>
                    <td className="py-2 pr-4 text-primary">{c.pricing}</td>
                    <td className="py-2 text-foreground/60 text-xs">{c.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Key insight: Pure AI agent companies charge premium flat fees as
            &quot;AI employees.&quot; Horizontal platforms use tiered + credits.
            Infrastructure providers use pure consumption.
          </p>
        </CardContent>
      </Card>

      {/* ── Section 4: Recommended 3-Layer Model ─────────────── */}
      <Card className="bg-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">
            Recommended: 3-Layer Pricing Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layer 1 */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px]"
              >
                Layer 1
              </Badge>
              <h3 className="text-sm font-semibold">
                Platform Fee — Monthly Base
              </h3>
            </div>
            <p className="text-xs text-foreground/70 mb-1">
              Covers deployment, integrations, maintenance, support,
              infrastructure.
            </p>
            <p className="text-sm text-primary font-medium">
              €1,500 - €5,000/mo
            </p>
            <p className="text-xs text-muted-foreground">
              Scales with client size and integration complexity. Includes up to
              N Workers + dashboard.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px]"
              >
                Layer 2
              </Badge>
              <h3 className="text-sm font-semibold">
                Per-Operation Fee — Variable
              </h3>
            </div>
            <p className="text-xs text-foreground/70 mb-3">
              Each unit of work completed by an AI Worker. Aligns cost with
              value.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground">Operation</th>
                    <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground">Price Range</th>
                    <th className="py-1.5 text-xs font-medium text-muted-foreground">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {OPERATION_PRICING.map((op, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5 pr-4 text-foreground/80">{op.operation}</td>
                      <td className="py-1.5 pr-4 text-primary font-medium">{op.priceRange}</td>
                      <td className="py-1.5 text-foreground/60 text-xs">{op.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px]"
              >
                Layer 3
              </Badge>
              <h3 className="text-sm font-semibold">
                Success Fee — Performance Bonus (Optional)
              </h3>
            </div>
            <p className="text-xs text-foreground/70">
              10-20% of measured savings above baseline. First 3 months
              establish baseline. Capped at 30% of total platform + operations
              cost. Only activate for clients with measurable, attributable pain
              points (e.g., demurrage).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Unit Economics ────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Unit Economics — Example Scenario
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Mid-size freight forwarder, 300 shipments/month
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground">Line Item</th>
                  <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground">Calculation</th>
                  <th className="py-1.5 text-xs font-medium text-muted-foreground text-right">Monthly</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/80">Platform fee</td>
                  <td className="py-1.5 pr-4 text-foreground/60">Fixed</td>
                  <td className="py-1.5 text-right text-foreground/80">€3,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/80">Document extraction</td>
                  <td className="py-1.5 pr-4 text-foreground/60">300 × 4 docs × €1.00</td>
                  <td className="py-1.5 text-right text-foreground/80">€1,200</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/80">Email handling</td>
                  <td className="py-1.5 pr-4 text-foreground/60">300 × 8 emails × €0.15</td>
                  <td className="py-1.5 text-right text-foreground/80">€360</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/80">Quote generation</td>
                  <td className="py-1.5 pr-4 text-foreground/60">150 quotes × €3.00</td>
                  <td className="py-1.5 text-right text-foreground/80">€450</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/80">Exception alerts</td>
                  <td className="py-1.5 pr-4 text-foreground/60">60 exceptions × €1.00</td>
                  <td className="py-1.5 text-right text-foreground/80">€60</td>
                </tr>
                <tr className="border-b border-border font-semibold">
                  <td className="py-2 pr-4 text-primary">Total Traza revenue</td>
                  <td className="py-2 pr-4"></td>
                  <td className="py-2 text-right text-primary">€5,070/mo</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground/60">COGS (LLM + infra)</td>
                  <td className="py-1.5 pr-4 text-foreground/60">~15-20%</td>
                  <td className="py-1.5 text-right text-foreground/60">~€900</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2 pr-4 text-green-400">Gross margin</td>
                  <td className="py-2 pr-4 text-green-400">82%</td>
                  <td className="py-2 text-right text-green-400">€4,170</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="text-sm font-semibold mb-2">Client ROI</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Replaces / augments</p>
                <p className="text-foreground font-medium">
                  2-3 FTEs (~€8,000-12,000/mo)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Demurrage reduction</p>
                <p className="text-foreground font-medium">
                  60-80% (~€6,000-8,000/mo)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total client value</p>
                <p className="text-foreground font-medium">
                  €14,000-20,000/mo
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Client pays Traza</p>
                <p className="text-primary font-medium">€5,070/mo</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-2xl font-bold text-primary">3-4x ROI</span>
              <p className="text-xs text-muted-foreground">
                Return on investment for the client
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
