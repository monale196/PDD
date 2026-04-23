export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

/* =====================
   CONFIGURACIÓN S3
===================== */

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
});

const BUCKET = "newsroomcache";
const S3_BASE_URL = `https://${BUCKET}.s3.eu-north-1.amazonaws.com/`;

/* =====================
   HELPERS
===================== */

const streamToString = async (stream: any): Promise<string> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
};

const getTodayParts = () => {
  const d = new Date();
  return {
    year: d.getFullYear().toString(),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

const getLatestDay = async (
  year: string,
  month: string
): Promise<string | null> => {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `data/news/${year}/${month}/`,
      Delimiter: "/",
    })
  );

  const days =
    res.CommonPrefixes?.map(
      p => p.Prefix!.split("/").slice(-2)[0]
    ) || [];

  return days.sort().pop() || null;
};

/* =========================================================
   GET → LEER ENTREVISTAS (S3)
========================================================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const articleKey = searchParams.get("article");
    const latestOnly = searchParams.get("latestOnly");
    const lang = searchParams.get("lang") || "en";
    const sectionFilter = searchParams.get("section");

    let year = searchParams.get("year");
    let month = searchParams.get("month");
    let day = searchParams.get("day");

    // ---------- ARTÍCULO ÚNICO ----------
    if (articleKey) {
      const txtObj = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: articleKey })
      );

      const text = await streamToString(txtObj.Body);
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

      return NextResponse.json({
        article: {
          id: articleKey,
          title: lines[0] || "",
          subtitle: lines[1] || "",
          body: lines.slice(2).join("\n"),
          txtUrl: `${S3_BASE_URL}${articleKey}`,
        },
      });
    }

    // ---------- FECHA ----------
    if (!year || !month) {
      const today = getTodayParts();
      year = today.year;
      month = today.month;
    }

    if (!day) {
      const latestDay = await getLatestDay(year, month);
      if (!latestDay) return NextResponse.json({ articles: [] });
      day = latestDay;
    }

    const basePrefix = `data/news/${year}/${month}/${day}/${lang}/`;

    // ---------- SECCIONES ----------
    const sectionsRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: basePrefix,
        Delimiter: "/",
      })
    );

    const sections =
      sectionsRes.CommonPrefixes?.map(p =>
        p.Prefix!.replace(basePrefix, "").replace("/", "")
      ) || [];

    const articles: any[] = [];

    // ---------- ARTÍCULOS ----------
    for (const section of sections) {
      if (sectionFilter && section !== sectionFilter) continue;

      const prefix = `${basePrefix}${section}/`;

      const filesRes = await s3.send(
        new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
      );

      const files = filesRes.Contents?.map(o => o.Key!) || [];

      const txtKey = files.find(f => f.endsWith("article.txt"));
      const imageKey = files.find(f => f.endsWith(".jpg"));
      if (!txtKey) continue;

      const txtObj = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: txtKey })
      );

      const text = await streamToString(txtObj.Body);
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

      articles.push({
        id: txtKey,
        section,
        title: lines[0] || "",
        subtitle: lines[1] || "",
        date: `${year}-${month}-${day}`,
        txtUrl: `${S3_BASE_URL}${txtKey}`,
        imageUrl: imageKey ? `${S3_BASE_URL}${imageKey}` : undefined,
        url: `/articulo/${encodeURIComponent(txtKey)}`,
      });
    }

    return NextResponse.json({
      articles: latestOnly ? articles.slice(0, sections.length) : articles,
      date: `${year}-${month}-${day}`,
      year,
      month,
      day,
      lang,
    });
  } catch (err) {
    console.error("❌ GET /api/admin/entrevistas error:", err);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}

/* =========================================================
   POST → GUARDAR ENTREVISTA (EDITOR)
========================================================= */

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("💾 Guardando entrevista:", data);

    // ✅ Aquí irá:
    // - generar article.txt
    // - subir article.txt a S3
    // - guardar imageKey / imageUrl (ya subidos)
    // - devolver confirmación

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ POST /api/admin/entrevistas error:", error);
    return NextResponse.json(
      { error: "Error guardando entrevista" },
      { status: 500 }
    );
  }
}