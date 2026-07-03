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
  const description = form.get("description");
  const dateRaw = form.get("date");
  const image = form.get("image");

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  if (typeof description !== "string" || description.trim() === "") {
    return NextResponse.json({ error: "La descripción es obligatoria" }, { status: 400 });
  }

  if (typeof dateRaw !== "string" || dateRaw.trim() === "") {
    return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
  }

  const date = new Date(dateRaw);

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "La fecha no es válida" }, { status: 400 });
  }

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, "events");
    } catch (err) {
      if (err instanceof ImageValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
    }
  }

  const event = await prisma.event.create({
    data: { title, description, date, imageUrl },
  });

  return NextResponse.json({ event }, { status: 201 });
}
