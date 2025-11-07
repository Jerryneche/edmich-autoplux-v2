// app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

// DISABLE BODY PARSING (NEW WAY)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Create upload directory if not exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  const parseForm = (): Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }> =>
    new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

  try {
    const { files } = await parseForm();
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file?.filepath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filePath = `/uploads/${path.basename(file.filepath)}`;
    return NextResponse.json({ url: filePath });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
