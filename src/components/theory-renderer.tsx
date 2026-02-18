import type { DomainTheoryData } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TheoryRendererProps {
  data: DomainTheoryData;
}

export function TheoryRenderer({ data }: TheoryRendererProps) {
  return (
    <div className="max-w-4xl space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">{data.overview.title}</h2>
        {data.overview.paragraphs.map((p, i) => (
          <p key={i} className="text-muted-foreground mb-3">
            {p}
          </p>
        ))}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Key Vocabulary</h3>
        <Accordion type="multiple" className="space-y-2">
          {data.vocabulary.map((item, i) => (
            <AccordionItem key={i} value={`vocab-${i}`}>
              <AccordionTrigger className="text-sm font-medium">
                {item.term}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p>{item.definition}</p>
                <p className="text-muted-foreground italic">
                  Example: {item.example}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Lifecycle / Workflow</h3>
        <div className="space-y-3">
          {data.lifecycle.map((step) => (
            <Card key={step.step}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full w-6 h-6 flex items-center justify-center p-0"
                  >
                    {step.step}
                  </Badge>
                  {step.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 text-sm text-muted-foreground">
                {step.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">
          AI &amp; Automation Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.aiUseCases.map((uc, i) => (
            <Card key={i}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">{uc.area}</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-1 text-sm">
                <p>{uc.description}</p>
                <p className="text-primary font-medium">
                  Impact: {uc.impact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
