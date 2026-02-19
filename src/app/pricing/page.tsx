import { ModuleLayout } from "@/components/module-layout";
import { PricingTheory } from "@/components/pricing-theory";

export default function PricingPage() {
  return (
    <ModuleLayout
      title="Pricing Strategy"
      description="AI Worker pricing models, market analysis, and strategy recommendations."
      theoryContent={<PricingTheory />}
      chatType="pricing"
    />
  );
}
