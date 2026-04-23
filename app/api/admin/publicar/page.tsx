"use client";

import { useState } from "react";

export default function PublicarHistoria() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoKey, setVideoKey] = useState("");

  /* ───────── SUBIR VIDEO GRANDE (MULTIPART) ───────── */
  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    // 1️⃣ Pedir URLs multipart
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    const { uploadId, partUrls, key, fileUrl, partSize } = await res.json();
    setVideoKey(key);

    // 2️⃣ Subir partes
    const parts: any[] = [];

    for (let i = 0; i < partUrls.length; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      const uploadRes = await fetch(partUrls[i], {
        method: "PUT",
        body: blob,
      });

      parts.push({
        ETag: uploadRes.headers.get("ETag"),
        PartNumber: i + 1,
      });

      setProgress(Math.round(((i + 1) / partUrls.length) * 100));
    }

    // 3️⃣ Completar upload
    await fetch("/api/complete-multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, parts }),
    });

    setVideoUrl(fileUrl);
    setUploading(false);
  };

  /* ───────── PUBLICAR ENTREVISTA ───────── */
  const publish = async () => {
    await fetch("/api/admin/entrevistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        body,
        videoUrl,
        videoKey,
      }),
    });

    alert("✅ Historia publicada");
    setTitle("");
    setSubtitle("");
    setBody("");
    setVideoUrl("");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      <h1 className="text-4xl font-extrabold text-center">
        Publicar Historia Viva
      </h1>

      {/* TEXTO */}
      <input
        className="w-full p-4 rounded-xl border text-lg"
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        className="w-full p-4 rounded-xl border text-lg"
        placeholder="Subtítulo"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
      />

      <textarea
        className="w-full p-4 rounded-xl border text-lg min-h-[200px]"
        placeholder="Contenido de la entrevista"
        value={body}
        onChange={e => setBody(e.target.value)}
      />

      {/* VIDEO */}
      <div className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-bold">🎬 Vídeo</h2>

        <input
          type="file"
          accept="video/*"
          onChange={e => e.target.files && handleVideoUpload(e.target.files[0])}
        />

        {uploading && (
          <div>
            <p>Subiendo vídeo… {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="space-y-3">
            <p className="text-green-600 font-semibold">
              ✅ Vídeo cargado correctamente
            </p>

            <video
              src={videoUrl}
              controls
              className="w-full rounded-xl shadow"
            />
          </div>
        )}
      </div>

      {/* PUBLICAR */}
      <button
        disabled={!title || !videoUrl}
        onClick={publish}
        className={`w-full py-4 text-xl font-bold rounded-full ${
          title && videoUrl
            ? "bg-black text-white"
            : "bg-gray-300 text-gray-500"
        }`}
      >
        Publicar
      </button>
    </div>
  );
}