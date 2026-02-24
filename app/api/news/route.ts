// app/api/news/route.ts
import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  CommonPrefix,
} from "@aws-sdk/client-s3";

/**
 * S3 client: NO pasamos 'credentials' para que Lambda/Amplify Hosting
 * use automáticamente el Compute Role que configuraste.
 */
const REGION = process.env.AMPLIFY_AWS_REGION || "eu-north-1";
const s3 = new S3Client({ region: REGION });

/** Bucket y base URL */
const BUCKET = "newsroomcache";
const S3_BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;

/** Helper: convierte el stream Body de S3 a string (TXT) */
const streamToString = async (stream: any): Promise<string> => {
  if (!stream) return "";
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};

/** Fecha de hoy en partes con cero inicial en mes/día */
const getTodayParts = () => {
  const d = new Date();
  return {
    year: d.getFullYear().toString(),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

/**
 * Busca el último 'day' disponible bajo:
 * data/news/<year>/<month>/
 * usando Delimiter "/" para obtener 'CommonPrefixes'
 */
const getLatestDay = async (year: string, month: string): Promise<string | null> => {
  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `data/news/${year}/${month}/`,
      Delimiter: "/",
    })
  );

  // De CommonPrefixes obtenemos los subdirectorios de day: .../<year>/<month>/<day>/
  const days =
    (list.CommonPrefixes || [])
      .map((p: CommonPrefix) => p.Prefix?.split("/").filter(Boolean).pop() || "")
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b));

  return days.length ? days[days.length - 1] : null;
};

export async function GET(req: Request) {
  const startedAt = Date.now();
  try {
    const { searchParams } = new URL(req.url);

    const latestOnly = searchParams.get("latestOnly");
    const sectionFilter = searchParams.get("section") || undefined;
    const debug = searchParams.get("debug") === "1";

    // Normalizamos el 'lang' a 'es' | 'en' (por defecto 'es' para maximizar resultados)
    const lang = (searchParams.get("lang") || "es").toLowerCase();

    let year = searchParams.get("year") || undefined;
    let month = searchParams.get("month") || undefined;
    let day = searchParams.get("day") || undefined;

    // Si no pasan año/mes, usamos hoy
    if (!year || !month) {
      const today = getTodayParts();
      year = today.year;
      month = today.month;
    }

    // Si no pasan 'day', buscamos el último día disponible en ese año/mes
    if (!day) {
      const latestDay = await getLatestDay(year!, month!);
      if (!latestDay) {
        return NextResponse.json(
          {
            articles: [],
            meta: debug
              ? { reason: "no-latest-day", year, month, triedPrefix: `data/news/${year}/${month}/` }
              : undefined,
          },
          { status: 200 }
        );
      }
      day = latestDay;
    }

    const basePrefix = `data/news/${year}/${month}/${day}/${lang}/`;

    // Listar secciones de ese idioma
    const sectionsRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: basePrefix,
        Delimiter: "/",
      })
    );

    const sections =
      (sectionsRes.CommonPrefixes || [])
        .map((p) => (p.Prefix || "").replace(basePrefix, "").replace("/", ""))
        .filter(Boolean);

    const articles: {
      section: string;
      title: string;
      subtitle?: string;
      date: string;
      txtUrl?: string;
      imageUrl?: string;
      url: string;
    }[] = [];

    // Recorremos secciones y recopilamos 1 artículo por carpeta
    for (const section of sections) {
      if (sectionFilter && section !== sectionFilter) continue;

      const prefix = `${basePrefix}${section}/`;

      const filesRes = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
        })
      );

      const files = (filesRes.Contents || []).map((o) => o.Key!).filter(Boolean);
      if (!files.length) continue;

      const txtKey =
        files.find((f) => f.endsWith("article.txt")) ||
        files.find((f) => f.toLowerCase().endsWith(".txt")); // fallback
      const imageKey =
        files.find((f) => f.toLowerCase().endsWith(".jpg")) ||
        files.find((f) => f.toLowerCase().endsWith(".jpeg")) ||
        files.find((f) => f.toLowerCase().endsWith(".png"));

      if (!txtKey) continue;

      // Leer TXT (primeras dos líneas no vacías = título y subtítulo)
      const txtObj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: txtKey }));
      const text = await streamToString(txtObj.Body);

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const title = lines[0] || "";
      const subtitle = lines[1] || "";

      const imageUrl = imageKey ? `${S3_BASE_URL}${imageKey}` : undefined;
      const txtUrl = txtKey ? `${S3_BASE_URL}${txtKey}` : undefined;

      articles.push({
        section,
        title,
        subtitle,
        date: `${year}-${month}-${day}`,
        txtUrl,
        imageUrl,
        url: `/secciones/${section}`,
      });
    }

    // latestOnly: devolvemos tal cual (un artículo por sección ya se da por estructura)
    if (latestOnly) {
      return NextResponse.json(
        {
          articles,
          date: `${year}-${month}-${day}`,
          meta: debug
            ? {
              region: REGION,
              bucket: BUCKET,
              basePrefix,
              sectionCount: sections.length,
              sections,
              tookMs: Date.now() - startedAt,
            }
            : undefined,
        },
        { status: 200 }
      );
    }

    // histórico o sección específica
    return NextResponse.json(
      {
        articles,
        date: `${year}-${month}-${day}`,
        year,
        month,
        day,
        lang,
        meta: debug
          ? {
            region: REGION,
            bucket: BUCKET,
            basePrefix,
            sectionCount: sections.length,
            sections,
            tookMs: Date.now() - startedAt,
          }
          : undefined,
      },
      { status: 200 }
    );
  } catch (err: any) {
    // Log detallado en CloudWatch (gracias a AWSLambdaBasicExecutionRole)
    console.error("❌ /api/news error:", err?.name, err?.message, err?.$metadata || "", err);

    // Para el cliente, no exponemos detalles, pero devolvemos estructura estable
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}