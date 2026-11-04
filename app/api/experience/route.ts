import { LEGACY_API_ENABLED } from "@/lib/launch";
import { NextResponse } from "next/server";
import { experience } from "@/data/portfolio";

export async function GET() {
  if (!LEGACY_API_ENABLED) return new NextResponse(null, { status: 404 }) // launch 1.0: not used by the site (lib/launch.ts)
  return NextResponse.json(experience);
}
