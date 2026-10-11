import type { NextRequest } from "next/server";
import type { ApiResponse } from "@/types/content";
import { content } from "@/data/content";

export async function GET(request: NextRequest) {
  const scenario = request.cookies.get("scenario")?.value;

  switch (scenario) {
    case "slow":
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return Response.json(content);

    case "error":
      return new Response("Internal Server Error", { status: 500 });

    case "empty":
      return Response.json({
        categories: { trending: [] },
      } satisfies ApiResponse);

    case "no-categories":
      return Response.json({});

    case "null-trending":
      return Response.json({ categories: { trending: null } });

    default:
      return Response.json(content);
  }
}
