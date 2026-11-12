"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { MemoryRouter } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { q: "Q1", value: 120 },
  { q: "Q2", value: 180 },
];

export default function Page() {
  return (
    <MemoryRouter>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4" /> Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Ok</Button>
          <div style={{ width: 300, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="q" />
                <YAxis />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </MemoryRouter>
  );
}
