import { ModuleLayout } from "@/components/module-layout";
import { FrameworkTheory } from "@/components/framework-theory";

export default function FrameworkPage() {
  return (
    <ModuleLayout
      title="Mental Framework"
      description="Internalize the 5-step problem-solving framework for AI automation design"
      theoryContent={<FrameworkTheory />}
      chatType="framework"
    />
  );
}
