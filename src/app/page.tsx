import { MODULES } from "@/lib/modules";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ApiKeyWarning } from "@/components/api-key-warning";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full overflow-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Traza Training Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          Master any industry domain through AI-powered training. Learn the
          theory, build mental frameworks, then practice with realistic
          simulations.
        </p>
      </div>

      <ApiKeyWarning />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.id} href={mod.href} className="block">
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {mod.order}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{mod.label}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium"
                    asChild
                  >
                    <span>
                      {mod.cta}{" "}
                      <ArrowRight className="ml-1 h-4 w-4 inline" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">
        Recommended path: Domain → Framework → Simulation
      </p>
    </div>
  );
}
