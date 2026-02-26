import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { builtinScenarios } from "@/lib/scenarios";
import type { Scenario } from "@/types/scenario";

interface CloudflareEnv {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

const CreateScenarioSchema = z.object({
  name: z.string().min(1, "シナリオ名は必須です"),
  category: z.string().min(1, "カテゴリは必須です"),
  definition: z.object({
    name: z.string(),
    description: z.string(),
    duration: z.number().min(1),
    events: z.array(z.any()),
  }),
});

/**
 * GET /api/scenarios
 * シナリオ一覧を取得（組み込み + カスタム）
 */
export async function GET(request: NextRequest, context?: { env?: CloudflareEnv }) {
  try {
    const scenarios: Scenario[] = [...builtinScenarios];

    // D1 からカスタムシナリオを取得
    const db = context?.env?.DB;
    if (db) {
      try {
        const result = await db
          .prepare("SELECT * FROM scenarios ORDER BY created_at DESC")
          .all<{
            id: string;
            name: string;
            category: string;
            created_by: string | null;
            definition: string;
            created_at: number;
          }>();

        if (result.success && result.results) {
          const customScenarios = result.results.map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            createdBy: row.created_by,
            definition: JSON.parse(row.definition),
            createdAt: row.created_at,
            isBuiltin: false,
          }));
          scenarios.push(...customScenarios);
        }
      } catch (error) {
        console.error("Failed to fetch custom scenarios from D1:", error);
        // D1 エラーは無視して組み込みのみ返す
      }
    }

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error("Fetch scenarios error:", error);
    return NextResponse.json({ error: "シナリオの取得に失敗しました" }, { status: 500 });
  }
}

/**
 * POST /api/scenarios
 * カスタムシナリオを作成
 */
export async function POST(request: NextRequest, context?: { env?: CloudflareEnv }) {
  try {
    const db = context?.env?.DB;
    if (!db) {
      return NextResponse.json({ error: "データベースが利用できません" }, { status: 503 });
    }

    // 認証チェック（SESSION_KV からユーザーIDを取得）
    const kv = context?.env?.SESSION_KV;
    let userId: string | null = null;
    if (kv) {
      const cookie = request.cookies.get("session");
      if (cookie?.value) {
        const session = await kv.get(`session:${cookie.value}`, "json") as { userId?: string } | null;
        userId = session?.userId || null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディをバリデーション
    const body = await request.json();
    const parsed = CreateScenarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "バリデーションエラー", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, category, definition } = parsed.data;
    const id = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = Date.now();

    // D1 にシナリオを保存
    await db
      .prepare(
        "INSERT INTO scenarios (id, name, category, created_by, definition, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, name, category, userId, JSON.stringify(definition), createdAt)
      .run();

    const scenario: Scenario = {
      id,
      name,
      category,
      createdBy: userId,
      definition,
      createdAt,
      isBuiltin: false,
    };

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error("Create scenario error:", error);
    return NextResponse.json({ error: "シナリオの作成に失敗しました" }, { status: 500 });
  }
}
