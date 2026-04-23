import { NextResponse } from "next/server";

const comments: any[] = []; // ⚠️ en memoria (válido para empezar)

export async function GET() {
  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const { text, name, anonymous } = await req.json();

  const comment = {
    id: Date.now(),
    text,
    name: anonymous ? "Anónimo" : name || "Anónimo",
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  comments.unshift(comment);

  return NextResponse.json(comment);
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  const c = comments.find(c => c.id === id);
  if (c) c.likes += 1;
  return NextResponse.json(c);
}