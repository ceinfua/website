# Guía: cómo publicar noticias y eventos

Esta guía es para administradores del sitio (rol `ADMIN`) que quieran publicar, editar o borrar
noticias y eventos, sin necesidad de tocar código. Si no tenés una cuenta con rol `ADMIN`, pedile
a otro admin que te lo asigne desde `/admin/roles` (ver `docs/proyecto.md`, sección 2).

## Publicar una noticia

1. Iniciá sesión y andá a **`/admin/news`**.
2. Hacé clic en **"Agregar noticia"**.
3. Completá:
   - **Título**
   - **Cuerpo** (el texto de la noticia)
   - **Imagen** (opcional): formatos aceptados PNG, JPEG o WEBP, hasta 5MB
4. Hacé clic en **"Publicar"**.

La noticia queda visible de inmediato en **`/news`**, la página pública. No hay borradores: lo
que publicás se ve al instante, así que revisá el texto antes de confirmar.

## Publicar un evento

1. Iniciá sesión y andá a **`/admin/events`**.
2. Hacé clic en **"Agregar evento"**.
3. Completá:
   - **Título**
   - **Descripción**
   - **Fecha** (fecha y hora del evento)
   - **Imagen** (opcional, mismos formatos y límite que en noticias)
4. Hacé clic en **"Publicar"**.

El evento aparece de inmediato en **`/events`**, la página pública:
- Si la fecha es futura, aparece en **"Próximos eventos"**.
- Si la fecha ya pasó (por ejemplo, si estás cargando un evento como registro histórico), aparece
  directamente en **"Eventos pasados"**.

## Editar o borrar una noticia o evento

Desde `/admin/news` o `/admin/events`, cada fila de la tabla tiene dos acciones:

- **Editar**: abre el mismo formulario con los datos actuales cargados. Podés cambiar cualquier
  campo, reemplazar la imagen, o sacar la imagen actual con "Quitar imagen". Los cambios se
  reflejan de inmediato en la página pública al guardar.
- **Eliminar**: borra la publicación de forma permanente, incluida su imagen si tenía una. No
  hay forma de deshacer esto: no existe una papelera ni un historial de versiones.

## Errores comunes

- **"El título es obligatorio" / "El cuerpo es obligatorio" / "La fecha es obligatoria"**: falta
  completar ese campo.
- **"Formato de imagen no soportado"**: la imagen no es PNG, JPEG ni WEBP.
- **"La imagen supera el tamaño máximo permitido (5MB)"**: elegí una imagen más liviana o
  comprimila antes de subirla.
- **"No se pudo subir la imagen"**: problema del lado del servidor (por ejemplo, el servicio de
  almacenamiento de imágenes no está configurado). Avisale a quien mantiene el sitio.
