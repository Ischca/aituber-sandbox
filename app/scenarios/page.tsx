"use client";

import { useEffect, useState } from "react";
import type { Scenario } from "@/types/scenario";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ListChecks } from "lucide-react";

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  async function loadScenarios() {
    try {
      const response = await fetch("/api/scenarios");
      const data = (await response.json()) as { scenarios?: Scenario[] };
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error("Failed to load scenarios:", error);
    } finally {
      setLoading(false);
    }
  }

  // カテゴリごとにグループ化
  const groupedScenarios = scenarios.reduce(
    (acc, scenario) => {
      if (!acc[scenario.category]) {
        acc[scenario.category] = [];
      }
      acc[scenario.category].push(scenario);
      return acc;
    },
    {} as Record<string, Scenario[]>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">シナリオ一覧</h1>
        <p className="text-muted-foreground">
          テストシナリオを選択してルームで再生できます
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      {scenario.isBuiltin && (
                        <Badge variant="secondary" className="shrink-0">
                          組み込み
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {scenario.definition.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{scenario.definition.duration}秒</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ListChecks className="h-4 w-4" />
                        <span>{scenario.definition.events.length}イベント</span>
                      </div>
                    </div>
                    {!scenario.isBuiltin && scenario.createdAt > 0 && (
                      <p className="text-xs text-muted-foreground">
                        作成: {new Date(scenario.createdAt).toLocaleString("ja-JP")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {scenarios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">シナリオがありません</p>
        </div>
      )}
    </div>
  );
}
