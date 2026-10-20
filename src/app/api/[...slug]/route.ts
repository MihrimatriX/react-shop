import { type NextRequest } from "next/server";
import { handle } from "@/server/handle";

export const dynamic = "force-dynamic";

async function handler(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handle(req, (await ctx.params).slug);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
