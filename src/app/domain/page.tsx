import { ModuleLayout } from "@/components/module-layout";
import { DomainTheory } from "@/components/domain-theory";

export default function DomainPage() {
  return (
    <ModuleLayout
      title="Domain Knowledge"
      description="Master freight forwarding terminology, workflows, and industry knowledge"
      theoryContent={<DomainTheory />}
      chatType="domain"
    />
  );
}
