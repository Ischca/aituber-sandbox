import { NextResponse } from "next/server";
import { builtinScenarios } from "@/lib/scenarios";

export async function GET() {
  return NextResponse.json({ scenarios: builtinScenarios });
}
