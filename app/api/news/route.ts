// app/api/news/route.ts
import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const SOURCE_BUCKET = process.env.S3_BUCKET || "newsroomcache";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const day = url.searchParams.get("day");
  const section = url.searchParams.get("section");

  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  // Construir prefijo según año/mes/día
  const prefix = day
    ? `data/news/${year}/${month}/${day}/`
    : `data/news/${year}/${month}/`;

  try {
    // Listar secciones (carpetas)
    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: SOURCE_BUCKET, Prefix: prefix, Delimiter: "/" })
    );

    const sections = result.CommonPrefixes?.map((p) => p.Prefix?.split("/").pop()) || [];

    // Si no se pidió sección ni día, devolver solo secciones
    if (!day && !section) {
      return NextResponse.json({ sections });
    }

    // Si se pidió sección + día, listar archivos
    if (section && day) {
      const sectionPrefix = `${prefix}${section}/`;
      const filesResult = await s3.send(
        new ListObjectsV2Command({ Bucket: SOURCE_BUCKET, Prefix: sectionPrefix })
      );

      const files = filesResult.Contents?.map((f) => f.Key) || [];
      return NextResponse.json({ files });
    }

    // Por defecto, devolver secciones
    return NextResponse.json({ sections });
  } catch (err) {
    console.error("Error listing objects from S3:", err);
    return NextResponse.json({ error: "Failed to fetch from S3" }, { status: 500 });
  }
}