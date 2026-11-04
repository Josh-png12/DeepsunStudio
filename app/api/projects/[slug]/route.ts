import { LEGACY_API_ENABLED } from "@/lib/launch";
import { NextResponse } from "next/server";
import { projects } from "@/data/portfolio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!LEGACY_API_ENABLED) return new NextResponse(null, { status: 404 }); // launch 1.0: not used by the site (lib/launch.ts)
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
