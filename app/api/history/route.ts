import { NextResponse } from "next/server";
import { getGlobalHistory } from "@/lib/history";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const history = await getGlobalHistory();
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
