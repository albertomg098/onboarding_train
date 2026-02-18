"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const VOCABULARY = [
  {
    term: "Freight Forwarder",
    definition:
      "A company that organizes shipments for individuals or corporations to get goods from manufacturer to market. They don't own transport vehicles — they act as intermediaries.",
    example: "Think of them as travel agents for cargo.",
  },
  {
    term: "Bill of Lading (B/L)",
    definition:
      "The most important document in shipping. It's simultaneously a receipt, a contract of carriage, and a document of title.",
    example:
      "Master B/L (MBL) is carrier-forwarder. House B/L (HBL) is forwarder-shipper.",
  },
  {
    term: "Incoterms",
    definition:
      "International Commercial Terms — 11 standardized rules defining who pays for what in a shipment.",
    example:
      "FOB (Free On Board): seller pays until goods are on the vessel. CIF (Cost, Insurance, Freight): seller pays freight + insurance.",
  },
  {
    term: "FCL / LCL",
    definition:
      "Full Container Load vs Less than Container Load. FCL = you rent the whole container. LCL = you share a container with other shippers.",
    example:
      "FCL is like renting a whole truck. LCL is like using a shared moving service.",
  },
  {
    term: "Demurrage",
    definition:
      "Penalty charged when a container stays at the port/terminal beyond the free time allowed.",
    example:
      "If you have 5 free days and pick up on day 8, you pay demurrage for 3 days. Can be $100-300/day per container.",
  },
  {
    term: "Detention",
    definition:
      "Penalty charged when a container is kept outside the port beyond allowed time.",
    example:
      "You picked up the container but took too long to unload and return it. Similar rates to demurrage.",
  },
  {
    term: "NVOCC",
    definition:
      "Non-Vessel Operating Common Carrier — a freight forwarder that issues their own B/L but doesn't own ships.",
    example:
      "They buy space from carriers in bulk and resell it, like a wholesaler.",
  },
  {
    term: "Customs Broker",
    definition:
      "Licensed professional who handles customs clearance — paperwork, tariff classification, duties/taxes.",
    example:
      "They ensure your shipment complies with import/export regulations.",
  },
  {
    term: "DUA (Documento Unico Administrativo)",
    definition:
      "Single Administrative Document — the customs declaration form used in the EU for imports/exports.",
    example:
      "Required for any goods entering or leaving the EU customs territory.",
  },
  {
    term: "Air Waybill (AWB)",
    definition:
      "The air freight equivalent of a B/L. Non-negotiable (unlike a B/L). Issued by the airline or agent.",
    example: "MAWB = airline-forwarder. HAWB = forwarder-shipper.",
  },
  {
    term: "EXW / DDP",
    definition:
      "EXW (Ex Works): buyer bears ALL transport costs and risk from seller's premises. DDP (Delivered Duty Paid): seller bears ALL costs including import duties.",
    example:
      "EXW = minimum seller responsibility. DDP = maximum seller responsibility.",
  },
  {
    term: "POD (Proof of Delivery)",
    definition:
      "Document confirming goods were delivered to the consignee. Triggers final invoicing.",
    example:
      "Usually a signed delivery receipt with date, time, and recipient name.",
  },
];

const LIFECYCLE_STEPS = [
  {
    step: 1,
    name: "Booking",
    description:
      "Client requests a shipment. Forwarder gets quotes from carriers, books space.",
  },
  {
    step: 2,
    name: "Pickup / Collection",
    description:
      "Goods collected from shipper's warehouse. Packing list verified.",
  },
  {
    step: 3,
    name: "Export Customs",
    description:
      "Documents submitted to customs at origin. DUA filed. Goods cleared for export.",
  },
  {
    step: 4,
    name: "Port / Airport Handling",
    description: "Container loaded onto vessel/aircraft. B/L or AWB issued.",
  },
  {
    step: 5,
    name: "Transit",
    description:
      "Goods in transit. Tracking updates. Transit time: 2-6 weeks sea, 2-5 days air.",
  },
  {
    step: 6,
    name: "Arrival / Discharge",
    description: "Vessel arrives at destination port. Container unloaded.",
  },
  {
    step: 7,
    name: "Import Customs",
    description:
      "Documents submitted at destination. Duties and taxes calculated and paid. Goods released.",
  },
  {
    step: 8,
    name: "Last-Mile Delivery",
    description:
      "Container transported from port to consignee's warehouse. Unloaded.",
  },
  {
    step: 9,
    name: "POD & Close",
    description:
      "Proof of Delivery signed. Container returned. File closed. Invoice sent.",
  },
];

const AI_USE_CASES = [
  {
    area: "Email Classification",
    description:
      "Auto-categorize incoming emails (booking requests, status inquiries, document submissions, complaints). Route to correct team.",
    impact: "Reduces manual triage by 80%+",
  },
  {
    area: "Document Extraction",
    description:
      "Extract structured data from B/Ls, invoices, packing lists. Populate TMS automatically.",
    impact: "Eliminates hours of manual data entry per shipment",
  },
  {
    area: "Exception Management",
    description:
      "Detect delays, missing documents, customs holds. Proactively notify stakeholders before they ask.",
    impact: "Reduces resolution time from hours to minutes",
  },
  {
    area: "Compliance Checks",
    description:
      "Validate documents against regulations. Flag missing fields, incorrect Incoterms, sanctioned entities.",
    impact: "Prevents costly customs delays and fines",
  },
];

export function DomainTheory() {
  return (
    <div className="max-w-4xl space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          What is Freight Forwarding?
        </h2>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            A freight forwarder is an intermediary that organizes the shipment of
            goods from point A to point B on behalf of shippers. They don&apos;t
            typically own transportation assets — instead, they negotiate with
            carriers (shipping lines, airlines, trucking companies) to move goods
            efficiently.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Think of them as the &quot;travel agents of cargo.&quot; A shipper
            says &quot;I need 500 boxes of electronics moved from Shenzhen to
            Rotterdam,&quot; and the forwarder handles everything: booking,
            documentation, customs, insurance, and tracking.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Key Vocabulary
        </h2>
        <Accordion type="multiple" className="space-y-2">
          {VOCABULARY.map((item, i) => (
            <AccordionItem
              key={i}
              value={`vocab-${i}`}
              className="border border-border rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                {item.term}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-foreground/80 mb-2">
                  {item.definition}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {item.example}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Shipment Lifecycle
        </h2>
        <div className="space-y-2">
          {LIFECYCLE_STEPS.map((step) => (
            <Card
              key={step.step}
              className="p-3 bg-card border-border flex items-start gap-3"
            >
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 flex-shrink-0 mt-0.5"
              >
                {step.step}
              </Badge>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Where AI Fits (Traza&apos;s Domain)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {AI_USE_CASES.map((uc, i) => (
            <Card key={i} className="p-4 bg-card border-border">
              <h3 className="text-sm font-semibold text-primary mb-1">
                {uc.area}
              </h3>
              <p className="text-xs text-foreground/80 mb-2">
                {uc.description}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/5 text-primary/80 border-primary/20"
              >
                Impact: {uc.impact}
              </Badge>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
