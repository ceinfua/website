import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { uploadImage, ImageValidationError } from "@/lib/blob";
import { Role } from "@/app/generated/prisma/enums";

export async function POST(request: Request) {
  const result = await requireRole([Role.ADMIN]);

  if (!result.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: result.status });
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo de formulario inválido" }, { status: 400 });
  }

  const title = form.get("title");
  const body = form.get("body");
  const image = form.get("image");

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  if (typeof body !== "string" || body.trim() === "") {
    return NextResponse.json({ error: "El cuerpo es obligatorio" }, { status: 400 });
  }

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, "news");
    } catch (err) {
      if (err instanceof ImageValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
    }
  }

  const news = await prisma.news.create({
    data: { title, body, imageUrl },
  });

  return NextResponse.json({ news }, { status: 201 });
}
