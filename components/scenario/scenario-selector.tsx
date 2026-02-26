"use client";

import { useEffect, useState } from "react";
import type { Scenario } from "@/types/scenario";
import { Badge } from "@/components/ui/badge";
import { Clock, ListChecks } from "lucide-react";

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");

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

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelectedId(value);
    const scenario = scenarios.find((s) => s.id === value);
    if (scenario) {
      onSelect(scenario);
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

  const selectedScenario = scenarios.find((s) => s.id === selectedId);

  return (
    <div className="space-y-4">
      <select
        value={selectedId}
        onChange={handleSelect}
        disabled={loading}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{loading ? "読み込み中..." : "シナリオを選択"}</option>
        {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
          <optgroup key={category} label={category}>
            {categoryScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} {scenario.isBuiltin ? "(組み込み)" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {selectedScenario && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm mb-1">{selectedScenario.name}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedScenario.definition.description}
              </p>
            </div>
            {selectedScenario.isBuiltin && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                組み込み
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{selectedScenario.definition.duration}秒</span>
            </div>
            <div className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              <span>{selectedScenario.definition.events.length}イベント</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
