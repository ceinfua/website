# Notas de Desarrollo Local

Notas de trabajo sobre cómo dejar Postgres/Prisma/Docker funcionando localmente, y cómo encajan
la autenticación y los roles. Complementa los pasos de configuración del `README.md` raíz. Leé
ese primero si estás empezando de cero.

## Docker

Postgres corre como contenedor (`docker-compose.yml`, `network_mode: host`, por lo que se
accede en `127.0.0.1:5432` sin necesidad de mapear puertos).

- Iniciarlo: `docker compose up -d` (desde la raíz del repo)
- Verificar que esté sano: `docker compose ps`. El STATUS debe decir `Up`, no estar
  reiniciándose en loop
- Detenerlo (mantiene los datos, en el volumen `postgres_data`): `docker compose down`
- El contenedor tiene `restart: unless-stopped`, así que una vez iniciado sobrevive a reinicios
  del daemon de Docker por sí solo: en general solo hace falta correr `docker compose up -d`
  después de un reinicio de la máquina o de un `down` explícito.
- El *daemon* de Docker está habilitado para iniciar en el arranque (`systemctl enable docker`),
  así que en la práctica ya no debería hacer falta tocar `systemctl start docker` manualmente.

Si `npx prisma studio` (o cualquier comando de Prisma) falla con
**"could not load schema metadata"**, casi siempre es porque Postgres no estaba accesible en
ese momento. Revisá `docker compose ps` antes de asumir que el schema en sí está roto.

## Campos id de Prisma: por qué ahora son UUIDs y no cuids

Originalmente, el `id` de cada modelo era `String @id @default(cuid())`. Ese default lo genera
**Prisma Client en el código de la aplicación**, no Postgres. Eso causaba un problema real:
Prisma Studio habla directamente con Postgres, así que no tiene forma de generar un cuid:
"Insert row" mostraba `id` como `(empty string)` (inválido) en vez de `(default value)` como sí
mostraban otras columnas con default (`createdAt`, `estado`).

Se solucionó en la migración `20260702032455_db_generated_ids` moviendo el default a la base de
datos:

```prisma
id String @id @default(dbgenerated("gen_random_uuid()::text"))
```

`gen_random_uuid()` es una función nativa de Postgres 13+ (no requiere extensión). Ahora es
Postgres el que completa `id` al insertar, así que tanto la app como Prisma Studio pueden crear
filas sin especificarlo.

Efecto práctico: las filas viejas (creadas antes de esta migración) siguen teniendo ids con
formato cuid, como `cmr2to2xq0000ixwkcwl493rg`; lo que se inserte después tendrá formato UUID,
como `49621911-ff30-4693-865c-319f029f916f`. Ambos son strings únicos y válidos: a la app no
le importa el formato, solo que `id` sea único y estable.

## Cómo agregar datos: dos formas

**Prisma Studio** (`npx prisma studio`): útil para ediciones/seeding manual rápido de modelos
simples como `News`/`Event`. Se salta toda la lógica de la app, así que conviene evitarlo para
`User`/`Student`: no hashea contraseñas, no verifica email, no aplica las validaciones de
cambio de rol.

**A través de la app**: el camino real para datos de `User`/`Student`.
- `/register`: autorregistro público, siempre crea una cuenta `Role.STUDENT` junto con su fila
  `Student` vinculada. Envía un email de verificación (ver abajo).
- `/claim-account?token=...`: para cuentas que un admin creó directamente (por ejemplo desde
  `/admin/roles` o un futuro flujo de invitación), con un `claimToken`; la persona invitada
  define su propia contraseña acá para activar la cuenta.
- `/admin/roles`: UI exclusiva de admin para cambiar el `role` de un usuario existente.
  Respaldada por `PATCH /api/admin/users/[id]/role`, que está protegida con
  `requireRole([Role.ADMIN])` y rechaza degradar al último admin restante.

Intencionalmente **no existe un signup público para roles que no sean STUDENT**: las cuentas
`ADMIN`, `CEINFUA_MEMBER` y `EXTERNAL_PARTNER` solo surgen de que un admin ya existente
promueva a un usuario desde `/admin/roles`, o del flujo de invitación por claim-account. Editar
`role` directamente en Prisma Studio también funciona, pero se salta esas validaciones. Está
bien para pruebas locales, pero no es algo para depender en general.

## Email en desarrollo

`RESEND_API_KEY` se deja vacío localmente a propósito. `lib/email.ts` detecta que falta la
clave y, en vez de enviar el email, lo imprime (asunto + cuerpo HTML, incluyendo el link de
verificación o de claim) en la terminal donde corre `npm run dev`. Para completar los flujos de
registro o claim-account localmente: enviá el formulario y después copiá el link del log del
servidor y abrilo en el navegador.

## Subida de imágenes (News/Events) con Vercel Blob

`BLOB_READ_WRITE_TOKEN` (`.env`) es el token de lectura/escritura de un store de Vercel Blob.
Se obtiene desde el dashboard de Vercel (Storage → Blob → crear/seleccionar un store → Tokens).
Sin este token seteado, subir una imagen desde `/admin/news` va a fallar con un error 500 al
intentar guardar la noticia (el resto del formulario, sin imagen, funciona igual). `lib/blob.ts`
valida tipo (`png`/`jpeg`/`webp`) y tamaño (máx. 5MB) del lado del servidor antes de subir, y se
encarga de borrar la imagen vieja del blob store al reemplazarla o al borrar la noticia.

## Credenciales del admin inicial (bootstrap)

Sembradas por `prisma/seed.ts` (`npx prisma db seed`):

- email: `admin@ceinfua.local`
- contraseña: la que hayas puesto en `ADMIN_SEED_PASSWORD` (`.env`)

`ADMIN_SEED_PASSWORD` no tiene valor por defecto: el script falla explícitamente si no está
seteada. Esto es intencional (el proyecto es público bajo AGPL-3.0-or-later desde que se agregó
esto): no puede haber una contraseña de admin hardcodeada en el código que cualquiera pueda leer
y probar contra un deploy real. Elegí una contraseña propia en `.env` antes de correr el seed.
