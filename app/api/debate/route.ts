import { NextResponse } from "next/server";

const debates: Record<string, any[]> = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");

  return NextResponse.json(debates[articleId || ""] || []);
}

export async function POST(req: Request) {
  const { articleId, text, name, anonymous } = await req.json();

  if (!debates[articleId]) {
    debates[articleId] = [];
  }

  const comment = {
    id: Date.now(),
    text,
    name: anonymous ? "Anónimo" : name || "Anónimo",
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  debates[articleId].unshift(comment);

  return NextResponse.json(comment);
}

export async function PATCH(req: Request) {
  const { articleId, commentId } = await req.json();

  const comments = debates[articleId] || [];
  const c = comments.find(c => c.id === commentId);
  if (c) c.likes += 1;

  return NextResponse.json(c);
}
