"use client";

import { CompoundCalculator } from "@/components/tools/CompoundCalculator";
import { ScenarioSimulator } from "@/components/tools/ScenarioSimulator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">Calculators and scenario analysis for financial planning.</p>
      </div>
      <Tabs defaultValue="compound">
        <TabsList>
          <TabsTrigger value="compound">Compound Calculator</TabsTrigger>
          <TabsTrigger value="scenario">Scenario Simulator</TabsTrigger>
        </TabsList>
        <TabsContent value="compound" className="mt-4"><CompoundCalculator /></TabsContent>
        <TabsContent value="scenario" className="mt-4"><ScenarioSimulator /></TabsContent>
      </Tabs>
    </div>
  );
}
