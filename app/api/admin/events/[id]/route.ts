import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { uploadImage, deleteImage, ImageValidationError } from "@/lib/blob";
import { Role } from "@/app/generated/prisma/enums";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const result = await requireRole([Role.ADMIN]);

  if (!result.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: result.status });
  }

  const existing = await prisma.event.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
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
  const removeImage = form.get("removeImage") === "true";

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

  let imageUrl = existing.imageUrl;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, "events");
    } catch (err) {
      if (err instanceof ImageValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
    }
  } else if (removeImage) {
    imageUrl = null;
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { title, description, date, imageUrl },
  });

  const oldImageReplaced = existing.imageUrl && existing.imageUrl !== updated.imageUrl;

  if (oldImageReplaced) {
    await deleteImage(existing.imageUrl!);
  }

  return NextResponse.json({ event: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const result = await requireRole([Role.ADMIN]);

  if (!result.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: result.status });
  }

  const existing = await prisma.event.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  if (existing.imageUrl) {
    await deleteImage(existing.imageUrl);
  }

  return new NextResponse(null, { status: 204 });
}
