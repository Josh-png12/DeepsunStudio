import { LEGACY_API_ENABLED } from "@/lib/launch";
import { NextResponse } from "next/server";
import { projects } from "@/data/portfolio";

export async function GET(request: Request) {
  if (!LEGACY_API_ENABLED) return new NextResponse(null, { status: 404 }) // launch 1.0: not used by the site (lib/launch.ts)
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let result = [...projects];

  if (category) {
    result = result.filter((p) => p.category === category);
  }
  if (featured === "true") {
    result = result.filter((p) => p.featured);
  }

  return NextResponse.json(result);
}
