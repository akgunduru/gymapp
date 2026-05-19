import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Social Gym System",
    status: "ok",
    phase: "foundation",
  });
}
