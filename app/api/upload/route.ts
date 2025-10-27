import { NextResponse } from "next/server";
import formidable from "formidable";

import path from "path";

export const config = {
  api: {
    bodyParser: false, // disable Next.js body parsing
  },
};

export async function POST(req: Request) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public/uploads"),
      keepExtensions: true,
    });

    form.parse(req as any, (err, fields, files) => {
      if (err) {
        reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
        return;
      }

      const file = files.file?.[0];
      if (!file) {
        reject(
          NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        );
        return;
      }

      const filePath = "/uploads/" + path.basename(file.filepath);
      resolve(NextResponse.json({ url: filePath }));
    });
  });
}
