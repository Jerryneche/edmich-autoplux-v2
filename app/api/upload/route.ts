import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import path from "path";
import { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const form = formidable({
    uploadDir: path.join(process.cwd(), "public/uploads"),
    keepExtensions: true,
  });

  const parseForm = (): Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }> =>
    new Promise((resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

  try {
    const { files } = await parseForm();
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filePath = "/uploads/" + path.basename(file.filepath);
    return NextResponse.json({ url: filePath });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
