import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY!,
    secretAccessKey: process.env.AWS_SECRET!,
  },
});

const SOURCE_BUCKET = process.env.S3_BUCKET || "newsroomcache";

// Función para leer objeto como texto
async function readObjectAsText(key: string): Promise<string> {
  const data = await s3.send(new GetObjectCommand({ Bucket: SOURCE_BUCKET, Key: key }));
  const stream = data.Body as any;
  const chunks: Uint8Array[] = [];
  for await (let chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const day = url.searchParams.get("day");
  const section = url.searchParams.get("section");

  if (!year || !month) return NextResponse.json({ error: "year and month required" }, { status: 400 });

  // Listar objetos en el bucket
  const prefix = day
    ? `data/news/${year}/${month}/${day}/`
    : `data/news/${year}/${month}/`;

  const result = await s3.send(new ListObjectsV2Command({ Bucket: SOURCE_BUCKET, Prefix: prefix, Delimiter: "/" }));

  const sections = result.CommonPrefixes?.map((p) => p.Prefix?.split("/").pop()) || [];

  // Retornar secciones disponibles si no hay day y section
  if (!day && !section) return NextResponse.json({ sections });

  // Si section está definido, listar archivos
  if (section && day) {
    const sectionPrefix = `${prefix}${section}/`;
    const filesResult = await s3.send(new ListObjectsV2Command({ Bucket: SOURCE_BUCKET, Prefix: sectionPrefix }));
    const files = filesResult.Contents?.map((f) => f.Key) || [];
    return NextResponse.json({ files });
  }

  return NextResponse.json({ sections });
}
