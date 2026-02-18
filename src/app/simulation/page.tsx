import { ModuleLayout } from "@/components/module-layout";
import { SimulationTheory } from "@/components/simulation-theory";

export default function SimulationPage() {
  return (
    <ModuleLayout
      title="Scenario Simulation"
      description="Practice with realistic work trial scenarios and get scored"
      theoryContent={<SimulationTheory />}
      chatType="simulation"
    />
  );
}
