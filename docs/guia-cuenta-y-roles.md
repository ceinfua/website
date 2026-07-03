# Guía: cambiar tu contraseña y gestionar roles

Esta guía es para cualquier usuario que quiera cambiar su propia contraseña, y para
administradores (rol `ADMIN`) que necesiten cambiar el rol de otro usuario. No hace falta tocar
código para ninguna de las dos cosas.

## Cambiar tu contraseña

Cualquier usuario con sesión iniciada puede cambiar su propia contraseña, sin importar su rol.

1. Iniciá sesión y andá a **`/profile`**.
2. En la sección de contraseña, completá:
   - **Contraseña actual**
   - **Contraseña nueva**
   - **Confirmar contraseña nueva**
3. Confirmá el cambio.

No existe un flujo de "olvidé mi contraseña" sin sesión iniciada: si no podés iniciar sesión,
necesitás que un `ADMIN` te reactive la cuenta por otra vía (ver `docs/proyecto.md`, no está
soportado el reseteo directo de contraseña de otro usuario).

### Errores comunes al cambiar la contraseña

- **"Las contraseñas nuevas no coinciden"**: lo que escribiste en "Contraseña nueva" y
  "Confirmar contraseña nueva" no es igual.
- **"Contraseña actual incorrecta"**: la contraseña actual que ingresaste no es la correcta.
- **"La contraseña debe tener al menos 8 caracteres"**: la contraseña nueva es demasiado corta.

## Cambiar el rol de un usuario (solo ADMIN)

Solo alguien con rol `ADMIN` puede cambiar el rol de otro usuario. No existe una forma pública de
autoasignarse un rol distinto de `STUDENT`.

1. Iniciá sesión con una cuenta `ADMIN` y andá a **`/admin/roles`**.
2. Vas a ver una tabla con todos los usuarios (correo y rol actual).
3. Elegí el nuevo rol desde el desplegable en la fila del usuario que querés cambiar:
   `STUDENT`, `CEINFUA_MEMBER`, `ADMIN` o `EXTERNAL_PARTNER`.
4. El cambio se aplica al instante, sin un botón de "guardar" aparte.

### Restricciones al cambiar roles

- **No podés quitarte tu propio rol de admin**: si intentás bajarte de `ADMIN` a otro rol desde
  tu propia fila, el sistema lo rechaza.
- **No se puede degradar al último `ADMIN` restante**: si sos el único admin del sistema, no se
  puede cambiar tu rol (ni el de nadie más, porque no hay otro admin) hasta que exista al menos
  otro `ADMIN`. Esto evita quedar sin ningún admin.

### Errores comunes al cambiar roles

- **"No podés quitarte tu propio rol de admin"**: estás intentando cambiar tu propio rol desde
  `ADMIN` a otro.
- **"No se puede degradar al último admin restante"**: sos el único `ADMIN` del sistema.
- **"Rol inválido"**: error interno, no debería aparecer en uso normal — avisale a quien
  mantiene el sitio si lo ves.

## Ver también

- `docs/guia-publicar-contenido.md` — cómo publicar noticias y eventos
- `docs/proyecto.md` — visión general de cómo funciona el sistema de roles y cuentas
