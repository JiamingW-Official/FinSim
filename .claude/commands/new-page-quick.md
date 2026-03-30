# Quick New Page

Quickly scaffold a new FinSim dashboard page with minimal boilerplate.

**Usage:** `/new-page-quick <route> <title> <seed> <tab1> <tab2> <tab3> <tab4>`

## Instructions

Create `src/app/(dashboard)/<route>/page.tsx` with this exact structure:

```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

let s = SEED;
const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

// Generate 20 data points
const DATA = Array.from({ length: 20 }, (_, i) => ({
  i,
  a: rand() * 100,
  b: rand() * 100 - 50,
  c: rand() * 200 + 50,
}));

export default function TITLEPage() {
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">TITLE</h1>
        <Badge variant="outline">Simulator</Badge>
      </motion.div>

      <Tabs defaultValue="TAB1_ID">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="TAB1_ID">TAB1</TabsTrigger>
          <TabsTrigger value="TAB2_ID">TAB2</TabsTrigger>
          <TabsTrigger value="TAB3_ID">TAB3</TabsTrigger>
          <TabsTrigger value="TAB4_ID">TAB4</TabsTrigger>
        </TabsList>

        <TabsContent value="TAB1_ID" className="data-[state=inactive]:hidden mt-4">
          <Card>
            <CardHeader><CardTitle>TAB1</CardTitle></CardHeader>
            <CardContent>
              {/* SVG chart + data table */}
              <svg viewBox="0 0 400 160" className="w-full border rounded">
                {DATA.slice(0,10).map((d,i) => (
                  <rect key={i} x={10+i*38} y={160-d.a-10} width={30} height={d.a}
                    fill="#3b82f6" rx={3} />
                ))}
              </svg>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repeat pattern for TAB2, TAB3, TAB4 with appropriate content */}
      </Tabs>
    </div>
  );
}
```

Fill in meaningful financial content for each tab based on the title and topic.
Make each tab substantive — at least one SVG visualization + data table/metrics per tab.
